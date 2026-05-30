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
import { LatestSupportedPHPVersion, PHP, type AllPHPVersion } from "@php-wasm/universal";
import { loadWebRuntime, type PHPWebLoaderOptions } from "@php-wasm/web";

const PHP_WORKDIR = "/www";
const PHP_ENTRYPOINT = `${PHP_WORKDIR}/index.php`;

type PHPStatus = "loading" | "ready" | "error";

export type PHPExecutionResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
  httpStatusCode: number;
  headers: Record<string, string[]>;
};

type PHPContextValue = {
  php: PHP | null;
  phpVersion: AllPHPVersion;
  error: Error | null;
  status: PHPStatus;
  version: number;
  execute: (code: string) => Promise<PHPExecutionResult>;
  resetEnvironment: () => Promise<void>;
};

const PHPContext = createContext<PHPContextValue | null>(null);

type PHPProviderProps = {
  children: ReactNode;
  phpVersion?: AllPHPVersion;
  loaderOptions?: PHPWebLoaderOptions;
};

function toError(caughtError: unknown) {
  return caughtError instanceof Error ? caughtError : new Error("Impossibile inizializzare PHP.");
}

function normalizePHPCode(code: string) {
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

async function createPHPEnvironment(
  phpVersion: AllPHPVersion,
  loaderOptions?: PHPWebLoaderOptions,
) {
  const php = new PHP(await loadWebRuntime(phpVersion, loaderOptions));
  php.mkdir(PHP_WORKDIR);
  php.chdir(PHP_WORKDIR);
  php.writeFile(`${PHP_WORKDIR}/index.php`, '<?php\necho "Hello, World!";\n\n?>');
  return php;
}

export function PHPProvider({
  children,
  phpVersion = LatestSupportedPHPVersion,
  loaderOptions,
}: PHPProviderProps) {
  const phpRef = useRef<PHP | null>(null);
  const [php, setPHP] = useState<PHP | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<PHPStatus>("loading");
  const [version, setVersion] = useState(0);

  const initializePHP = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const nextPHP = await createPHPEnvironment(phpVersion, loaderOptions);

      closePHPEnvironment(phpRef.current);
      phpRef.current = nextPHP;
      setPHP(nextPHP);
      setVersion((currentVersion) => currentVersion + 1);
      setStatus("ready");
    } catch (caughtError) {
      closePHPEnvironment(phpRef.current);
      phpRef.current = null;
      setPHP(null);
      setError(toError(caughtError));
      setStatus("error");
    }
  }, [loaderOptions, phpVersion]);

  useEffect(() => {
    let isMounted = true;

    async function initializeMountedPHP() {
      setStatus("loading");
      setError(null);

      try {
        const nextPHP = await createPHPEnvironment(phpVersion, loaderOptions);

        if (!isMounted) {
          closePHPEnvironment(nextPHP);
          return;
        }

        closePHPEnvironment(phpRef.current);
        phpRef.current = nextPHP;
        setPHP(nextPHP);
        setVersion((currentVersion) => currentVersion + 1);
        setStatus("ready");
      } catch (caughtError) {
        if (!isMounted) {
          return;
        }

        closePHPEnvironment(phpRef.current);
        phpRef.current = null;
        setPHP(null);
        setError(toError(caughtError));
        setStatus("error");
      }
    }

    void initializeMountedPHP();

    return () => {
      isMounted = false;
      closePHPEnvironment(phpRef.current);
      phpRef.current = null;
    };
  }, [loaderOptions, phpVersion]);

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
      phpVersion,
      error,
      status,
      version,
      execute,
      resetEnvironment,
    }),
    [php, phpVersion, error, status, version, execute, resetEnvironment],
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
