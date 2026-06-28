import type { PGlite, Results } from "@electric-sql/pglite";
import { getPGliteAssetOptions, getPGliteConstructor } from "#/lib/postgres/assets";
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

type PostgresStatus = "loading" | "ready" | "error";

type PostgresState =
  | { db: null; error: null; status: "loading" }
  | { db: PGlite; error: null; status: "ready" }
  | { db: null; error: Error; status: "error" };

type PostgresContextValue = {
  db: PGlite | null;
  error: Error | null;
  status: PostgresStatus;
  version: number;
  execute: (sql: string) => Promise<Results[]>;
  resetDatabase: () => Promise<void>;
};

const PostgresContext = createContext<PostgresContextValue | null>(null);

function toError(caughtError: unknown) {
  return caughtError instanceof Error
    ? caughtError
    : new Error("Impossibile inizializzare PostgreSQL.");
}

export function PostgresProvider({ children }: { children: ReactNode }) {
  const dbRef = useRef<PGlite | null>(null);
  const operationRef = useRef(0);
  const [{ db, error, status }, setState] = useState<PostgresState>({
    db: null,
    error: null,
    status: "loading",
  });
  const [version, setVersion] = useState(0);

  const closeDatabase = useCallback(async () => {
    const currentDb = dbRef.current;
    dbRef.current = null;

    if (currentDb) {
      await currentDb.close();
    }
  }, []);

  const markDatabaseReady = useCallback((nextDb: PGlite) => {
    setVersion((currentVersion) => currentVersion + 1);
    setState({ db: nextDb, error: null, status: "ready" });
  }, []);

  const createDatabase = useCallback(async () => {
    const operation = ++operationRef.current;

    setState({ db: null, error: null, status: "loading" });

    try {
      const PGliteConstructor = await getPGliteConstructor();
      const nextDb = await PGliteConstructor.create(await getPGliteAssetOptions());

      if (operation !== operationRef.current) {
        await nextDb.close();
        return;
      }

      dbRef.current = nextDb;
      markDatabaseReady(nextDb);
    } catch (caughtError) {
      if (operation !== operationRef.current) {
        return;
      }

      setState({ db: null, error: toError(caughtError), status: "error" });
    }
  }, [markDatabaseReady]);

  useEffect(() => {
    void createDatabase();

    return () => {
      operationRef.current += 1;
      void closeDatabase();
    };
  }, [closeDatabase, createDatabase]);

  const execute = useCallback(async (sql: string) => {
    const currentDb = dbRef.current;

    if (!currentDb) {
      throw new Error("PostgreSQL non e ancora pronto.");
    }

    const results = await currentDb.exec(sql);
    setVersion((currentVersion) => currentVersion + 1);
    return results;
  }, []);

  const resetDatabase = useCallback(async () => {
    setState({ db: null, error: null, status: "loading" });
    await closeDatabase();
    await createDatabase();
  }, [closeDatabase, createDatabase]);

  const value = useMemo<PostgresContextValue>(
    () => ({
      db,
      error,
      status,
      version,
      execute,
      resetDatabase,
    }),
    [db, error, status, version, execute, resetDatabase],
  );

  return <PostgresContext.Provider value={value}>{children}</PostgresContext.Provider>;
}

export function usePostgres() {
  const context = useContext(PostgresContext);

  if (!context) {
    throw new Error("usePostgres deve essere usato dentro PostgresProvider.");
  }

  return context;
}
