import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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

type PythonStatus = "loading" | "ready" | "error";

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
  const pyodide = await loadPyodide(loadOptions);
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
  const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<PythonStatus>("loading");
  const [version, setVersion] = useState(0);

  const initializePython = useCallback(
    async (isCurrent: () => boolean = () => true) => {
      setStatus("loading");
      setError(null);

      try {
        const nextPyodide = await createPythonEnvironment(loadOptions);

        if (!isCurrent()) {
          return;
        }

        pyodideRef.current = nextPyodide;
        setPyodide(nextPyodide);
        setVersion((currentVersion) => currentVersion + 1);
        setStatus("ready");
      } catch (caughtError) {
        if (!isCurrent()) {
          return;
        }

        pyodideRef.current = null;
        setPyodide(null);
        setError(toPythonError(caughtError));
        setStatus("error");
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
    setError(null);
    setStatus("ready");
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

type PythonEntrypointOptions = {
  content?: string;
  path?: string;
};

function includeAllPythonFiles() {
  return true;
}

export function usePythonFileSync(
  virtualFiles: VirtualFiles,
  { basePath = PYTHON_WORKDIR, include = includeAllPythonFiles }: PythonFileSyncOptions = {},
) {
  const { pyodide, status } = usePython();

  useEffect(() => {
    if (!pyodide || status !== "ready") {
      return;
    }

    for (const [path, content] of Object.entries(virtualFiles.files)) {
      if (include(path, content)) {
        writePythonFile(pyodide, toPythonPath(path, basePath), content ?? "");
      }
    }
  }, [basePath, include, pyodide, status, virtualFiles.files]);

  useEffect(() => {
    if (!pyodide || status !== "ready") {
      return;
    }

    return virtualFiles.onChange((previousFiles, nextFiles) => {
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

      for (const path of Object.keys(previousFiles)) {
        if (Object.hasOwn(nextFiles, path) || !include(path, previousFiles[path])) {
          continue;
        }

        removePythonPath(pyodide, toPythonPath(path, basePath));
      }
    });
  }, [basePath, include, pyodide, status, virtualFiles]);
}

export function usePythonEntrypoint(
  virtualFiles: VirtualFiles,
  { content = 'print("Hello, World!")\n', path = "main.py" }: PythonEntrypointOptions = {},
) {
  useEffect(() => {
    if (virtualFiles.get(path) !== undefined) {
      return;
    }

    virtualFiles.create(path, content);
  }, [content, path, virtualFiles]);
}
