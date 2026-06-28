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
import { PHP, type EmscriptenOptions } from "@php-wasm/universal";
import { LAB_PHP_VERSION, loadLabPHPRuntime } from "#/lib/php/runtime";

const PHP_WORKDIR = "/www";
const PHP_ENTRYPOINT = `${PHP_WORKDIR}/index.php`;

type PHPStatus = "loading" | "ready" | "error";

type PHPState =
  | { error: null; php: null; status: "loading" }
  | { error: null; php: PHP; status: "ready" }
  | { error: Error; php: null; status: "error" };

export type PHPExecutionResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
  httpStatusCode: number;
  headers: Record<string, string[]>;
};

type PHPContextValue = {
  php: PHP | null;
  phpVersion: typeof LAB_PHP_VERSION;
  error: Error | null;
  status: PHPStatus;
  version: number;
  execute: (code: string) => Promise<PHPExecutionResult>;
  resetEnvironment: () => Promise<void>;
};

const PHPContext = createContext<PHPContextValue | null>(null);

type PHPProviderProps = {
  children: ReactNode;
  loaderOptions?: EmscriptenOptions;
};

export function toPHPError(caughtError: unknown) {
  return caughtError instanceof Error ? caughtError : new Error("Impossibile inizializzare PHP.");
}

export function normalizePHPCode(code: string) {
  return code.includes("<?") ? code : `<?php\n${code}`;
}

function closePHPEnvironment(php: PHP | null) {
  if (!php) {
    return;
  }

  try {
    php.exit(0);
  } catch {
    // The runtime may already be closed after fatal execution failures.
  }
}

async function createPHPEnvironment(loaderOptions?: EmscriptenOptions) {
  const php = new PHP(await loadLabPHPRuntime(loaderOptions));
  php.mkdir(PHP_WORKDIR);
  php.chdir(PHP_WORKDIR);
  php.writeFile(`${PHP_WORKDIR}/index.php`, '<?php\necho "Hello, World!";\n\n?>');
  return php;
}

export function PHPProvider({ children, loaderOptions }: PHPProviderProps) {
  const phpRef = useRef<PHP | null>(null);
  const [{ error, php, status }, setState] = useState<PHPState>({
    error: null,
    php: null,
    status: "loading",
  });
  const [version, setVersion] = useState(0);

  const initializePHP = useCallback(
    async (isCurrent: () => boolean = () => true) => {
      setState({ error: null, php: null, status: "loading" });

      try {
        const nextPHP = await createPHPEnvironment(loaderOptions);

        if (!isCurrent()) {
          closePHPEnvironment(nextPHP);
          return;
        }

        closePHPEnvironment(phpRef.current);
        phpRef.current = nextPHP;
        setVersion((currentVersion) => currentVersion + 1);
        setState({ error: null, php: nextPHP, status: "ready" });
      } catch (caughtError) {
        if (!isCurrent()) {
          return;
        }

        closePHPEnvironment(phpRef.current);
        phpRef.current = null;
        setState({ error: toPHPError(caughtError), php: null, status: "error" });
      }
    },
    [loaderOptions],
  );

  useEffect(() => {
    let isMounted = true;

    void initializePHP(() => isMounted);

    return () => {
      isMounted = false;
      closePHPEnvironment(phpRef.current);
      phpRef.current = null;
    };
  }, [initializePHP]);

  const execute = useCallback(async (code: string) => {
    const currentPHP = phpRef.current;

    if (!currentPHP) {
      throw new Error("PHP non e ancora pronto.");
    }

    try {
      currentPHP.writeFile(PHP_ENTRYPOINT, normalizePHPCode(code));

      const response = await currentPHP.runStream({
        scriptPath: PHP_ENTRYPOINT,
        relativeUri: "/index.php",
        method: "GET",
      });

      const [stdout, stderr, exitCode, httpStatusCode, headers] = await Promise.all([
        response.stdoutText,
        response.stderrText,
        response.exitCode,
        response.httpStatusCode,
        response.headers,
      ]);

      return {
        stdout,
        stderr,
        exitCode,
        httpStatusCode,
        headers,
      };
    } finally {
      setVersion((currentVersion) => currentVersion + 1);
    }
  }, []);

  const resetEnvironment = useCallback(async () => {
    await initializePHP();
  }, [initializePHP]);

  const value = useMemo<PHPContextValue>(
    () => ({
      php,
      phpVersion: LAB_PHP_VERSION,
      error,
      status,
      version,
      execute,
      resetEnvironment,
    }),
    [php, error, status, version, execute, resetEnvironment],
  );

  return <PHPContext.Provider value={value}>{children}</PHPContext.Provider>;
}

export function usePHP() {
  const context = useContext(PHPContext);

  if (!context) {
    throw new Error("usePHP deve essere usato dentro PHPProvider.");
  }

  return context;
}
