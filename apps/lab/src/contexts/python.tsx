import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { dirname, normalize } from "pathe";
import { loadPyodide, type PyodideConfig, type PyodideInterface } from "pyodide";
import type { VirtualFiles } from "#/hooks/files";

export const PYTHON_WORKDIR = "/home/pyodide";
export const PYTHON_ENTRYPOINT = `${PYTHON_WORKDIR}/main.py`;
const PYODIDE_INDEX_URL = "https://cdn.jsdelivr.net/pyodide/v0.29.4/full/";

type PythonStatus = "loading" | "ready" | "error";

type PythonState =
  | { error: null; pyodide: null; status: "loading" }
  | { error: null; pyodide: PyodideInterface; status: "ready" }
  | { error: Error; pyodide: null; status: "error" };

export type PythonExecutionOptions = {
  filename?: string;
  loadPackagesFromImports?: boolean;
};

export type PythonExecutionResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
  result: unknown;
};

type PythonContextValue = {
  pyodide: PyodideInterface | null;
  error: Error | null;
  status: PythonStatus;
  version: number;
  execute: (code: string, options?: PythonExecutionOptions) => Promise<PythonExecutionResult>;
  resetEnvironment: () => Promise<void>;
};

const PythonContext = createContext<PythonContextValue | null>(null);

type PythonProviderProps = {
  children: ReactNode;
  loadOptions?: PyodideConfig;
};

type PyodideFileSystem = PyodideInterface["FS"] & {
  analyzePath: (path: string) => { exists: boolean; object?: { mode: number } };
  isDir: (mode: number) => boolean;
};

export function toPythonError(caughtError: unknown) {
  return caughtError instanceof Error
    ? caughtError
    : new Error("Impossibile inizializzare Python.");
}

export function toPythonPath(path: string, basePath = PYTHON_WORKDIR) {
  const normalizedPath = normalize(path);

  return normalizedPath.startsWith("/")
    ? normalizedPath
    : normalize(`${basePath}/${normalizedPath}`);
}

export function ensurePythonDirectory(pyodide: PyodideInterface, path: string) {
  const FS = pyodide.FS as PyodideFileSystem;
  const normalizedPath = normalize(path);

  if (normalizedPath === "/" || FS.analyzePath(normalizedPath).exists) {
    return;
  }

  ensurePythonDirectory(pyodide, dirname(normalizedPath));
  FS.mkdir(normalizedPath);
}

export function writePythonFile(pyodide: PyodideInterface, path: string, content: string) {
  const normalizedPath = normalize(path);

  ensurePythonDirectory(pyodide, dirname(normalizedPath));
  pyodide.FS.writeFile(normalizedPath, content);
}

export function removePythonPath(pyodide: PyodideInterface, path: string) {
  const FS = pyodide.FS as PyodideFileSystem;
  const normalizedPath = normalize(path);
  const analyzedPath = FS.analyzePath(normalizedPath);

  if (!analyzedPath.exists) {
    return;
  }

  if (analyzedPath.object && FS.isDir(analyzedPath.object.mode)) {
    clearPythonDirectory(pyodide, normalizedPath);
    FS.rmdir(normalizedPath);
    return;
  }

  FS.unlink(normalizedPath);
}

function clearPythonDirectory(pyodide: PyodideInterface, path: string) {
  const entries = pyodide.FS.readdir(path).filter((entry) => entry !== "." && entry !== "..");

  for (const entry of entries) {
    removePythonPath(pyodide, normalize(`${path}/${entry}`));
  }
}

async function resetPythonEnvironment(pyodide: PyodideInterface) {
  ensurePythonDirectory(pyodide, PYTHON_WORKDIR);
  clearPythonDirectory(pyodide, PYTHON_WORKDIR);
  writePythonFile(pyodide, PYTHON_ENTRYPOINT, 'print("Hello, World!")\n');
  pyodide.FS.chdir(PYTHON_WORKDIR);

  await pyodide.runPythonAsync(`
for __manuale_name in list(globals()):
    if not __manuale_name.startswith("__"):
        del globals()[__manuale_name]
del __manuale_name
`);
}

async function createPythonEnvironment(loadOptions?: PyodideConfig) {
  const pyodide = await loadPyodide({
    indexURL: PYODIDE_INDEX_URL,
    ...loadOptions,
  });
  await resetPythonEnvironment(pyodide);
  return pyodide;
}

function joinOutput(chunks: string[]) {
  return chunks.join("\n");
}

function toJavaScriptResult(result: unknown) {
  if (!result || typeof result !== "object") {
    return result;
  }

  const maybeProxy = result as {
    toJs?: (options?: {
      dict_converter?: (entries: Iterable<[string, unknown]>) => unknown;
    }) => unknown;
    destroy?: () => void;
  };

  if (!maybeProxy.toJs) {
    return result;
  }

  try {
    return maybeProxy.toJs({ dict_converter: Object.fromEntries });
  } finally {
    maybeProxy.destroy?.();
  }
}

export function PythonProvider({ children, loadOptions }: PythonProviderProps) {
  const pyodideRef = useRef<PyodideInterface | null>(null);
  const executionQueueRef = useRef<Promise<void>>(Promise.resolve());
  const [{ error, pyodide, status }, setState] = useState<PythonState>({
    error: null,
    pyodide: null,
    status: "loading",
  });
  const [version, setVersion] = useState(0);

  const initializePython = useCallback(
    async (isCurrent: () => boolean = () => true) => {
      setState({ error: null, pyodide: null, status: "loading" });

      try {
        const nextPyodide = await createPythonEnvironment(loadOptions);

        if (!isCurrent()) {
          return;
        }

        pyodideRef.current = nextPyodide;
        setVersion((currentVersion) => currentVersion + 1);
        setState({ error: null, pyodide: nextPyodide, status: "ready" });
      } catch (caughtError) {
        if (!isCurrent()) {
          return;
        }

        pyodideRef.current = null;
        setState({ error: toPythonError(caughtError), pyodide: null, status: "error" });
      }
    },
    [loadOptions],
  );

  useEffect(() => {
    let isMounted = true;

    void initializePython(() => isMounted);

    return () => {
      isMounted = false;
      pyodideRef.current = null;
    };
  }, [initializePython]);

  const executeCurrent = useCallback(async (code: string, options: PythonExecutionOptions = {}) => {
    const currentPyodide = pyodideRef.current;

    if (!currentPyodide) {
      throw new Error("Python non e ancora pronto.");
    }

    const stdout: string[] = [];
    const stderr: string[] = [];
    const filename = options.filename ?? PYTHON_ENTRYPOINT;

    currentPyodide.setStdout({ batched: (output) => stdout.push(output) });
    currentPyodide.setStderr({ batched: (output) => stderr.push(output) });

    try {
      writePythonFile(currentPyodide, filename, code);

      if (options.loadPackagesFromImports ?? true) {
        await currentPyodide.loadPackagesFromImports(code);
      }

      const result = await currentPyodide.runPythonAsync(code, { filename });

      return {
        stdout: joinOutput(stdout),
        stderr: joinOutput(stderr),
        exitCode: 0,
        result: toJavaScriptResult(result),
      };
    } catch (caughtError) {
      const pythonError = toPythonError(caughtError);

      if (stderr.length === 0) {
        stderr.push(pythonError.message);
      }

      return {
        stdout: joinOutput(stdout),
        stderr: joinOutput(stderr),
        exitCode: 1,
        result: null,
      };
    } finally {
      currentPyodide.setStdout();
      currentPyodide.setStderr();
      setVersion((currentVersion) => currentVersion + 1);
    }
  }, []);

  const execute = useCallback(
    (code: string, options?: PythonExecutionOptions) => {
      const queuedExecution = executionQueueRef.current.then(() => executeCurrent(code, options));

      executionQueueRef.current = queuedExecution.then(
        () => undefined,
        () => undefined,
      );

      return queuedExecution;
    },
    [executeCurrent],
  );

  const resetEnvironment = useCallback(async () => {
    const currentPyodide = pyodideRef.current;

    if (!currentPyodide) {
      await initializePython();
      return;
    }

    await resetPythonEnvironment(currentPyodide);
    setState({ error: null, pyodide: currentPyodide, status: "ready" });
    setVersion((currentVersion) => currentVersion + 1);
  }, [initializePython]);

  const value = useMemo<PythonContextValue>(
    () => ({
      pyodide,
      error,
      status,
      version,
      execute,
      resetEnvironment,
    }),
    [pyodide, error, status, version, execute, resetEnvironment],
  );

  return <PythonContext.Provider value={value}>{children}</PythonContext.Provider>;
}

export function usePython() {
  const context = useContext(PythonContext);

  if (!context) {
    throw new Error("usePython deve essere usato dentro PythonProvider.");
  }

  return context;
}

type PythonFileSyncOptions = {
  basePath?: string;
  include?: (path: string, content: string | undefined) => boolean;
};

const includeAllPythonFiles = () => true;

function syncPythonFiles(
  pyodide: PyodideInterface,
  files: Readonly<Record<string, string | undefined>>,
  basePath: string,
  include: (path: string, content: string | undefined) => boolean,
) {
  for (const [path, content] of Object.entries(files)) {
    if (!include(path, content)) {
      continue;
    }

    writePythonFile(pyodide, toPythonPath(path, basePath), content ?? "");
  }
}

function syncPythonFileChanges(
  pyodide: PyodideInterface,
  previousFiles: Readonly<Record<string, string | undefined>>,
  nextFiles: Readonly<Record<string, string | undefined>>,
  basePath: string,
  include: (path: string, content: string | undefined) => boolean,
) {
  for (const [path, content] of Object.entries(nextFiles)) {
    const wasIncluded = include(path, previousFiles[path]);
    const isIncluded = include(path, content);

    if (!isIncluded) {
      if (wasIncluded) {
        removePythonPath(pyodide, toPythonPath(path, basePath));
      }

      continue;
    }

    if (previousFiles[path] !== content) {
      writePythonFile(pyodide, toPythonPath(path, basePath), content ?? "");
    }
  }

  for (const [path, content] of Object.entries(previousFiles)) {
    if (Object.hasOwn(nextFiles, path) || !include(path, content)) {
      continue;
    }

    removePythonPath(pyodide, toPythonPath(path, basePath));
  }
}

export function usePythonFileSync(
  virtualFiles: VirtualFiles,
  { basePath = PYTHON_WORKDIR, include = includeAllPythonFiles }: PythonFileSyncOptions = {},
) {
  const { pyodide, status } = usePython();
  const { onChange } = virtualFiles;
  const syncCurrentFiles = useEffectEvent(
    (
      currentPyodide: PyodideInterface,
      currentBasePath: string,
      currentInclude: (path: string, content: string | undefined) => boolean,
    ) => {
      syncPythonFiles(currentPyodide, virtualFiles.files, currentBasePath, currentInclude);
    },
  );

  useEffect(() => {
    if (!pyodide || status !== "ready") {
      return;
    }

    syncCurrentFiles(pyodide, basePath, include);

    return onChange((previousFiles, nextFiles) => {
      syncPythonFileChanges(pyodide, previousFiles, nextFiles, basePath, include);
    });
  }, [basePath, include, onChange, pyodide, status]);
}
