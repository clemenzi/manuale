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
import initSqlJs, { type Database, type QueryExecResult, type SqlJsStatic } from "sql.js";
import sqliteWasmUrl from "sql.js/dist/sql-wasm.wasm?url";

type SQLiteStatus = "loading" | "ready" | "error";

type SQLiteContextValue = {
  SQL: SqlJsStatic | null;
  db: Database | null;
  error: Error | null;
  status: SQLiteStatus;
  version: number;
  execute: (sql: string) => QueryExecResult[];
  resetDatabase: () => void;
};

const SQLiteContext = createContext<SQLiteContextValue | null>(null);

type SQLiteProviderProps = {
  children: ReactNode;
};

function createDatabase(SQL: SqlJsStatic) {
  const db = new SQL.Database();
  db.run("PRAGMA foreign_keys = ON;");
  return db;
}

function toError(caughtError: unknown) {
  return caughtError instanceof Error
    ? caughtError
    : new Error("Impossibile inizializzare SQLite.");
}

export function SQLiteProvider({ children }: SQLiteProviderProps) {
  const dbRef = useRef<Database | null>(null);
  const [SQL, setSQL] = useState<SqlJsStatic | null>(null);
  const [db, setDb] = useState<Database | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<SQLiteStatus>("loading");
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function initializeSQLite() {
      try {
        setStatus("loading");
        setError(null);

        const SQLModule = await initSqlJs({
          locateFile: () => sqliteWasmUrl,
        });

        if (!isMounted) {
          return;
        }

        const nextDb = createDatabase(SQLModule);
        dbRef.current = nextDb;
        setSQL(SQLModule);
        setDb(nextDb);
        setVersion((currentVersion) => currentVersion + 1);
        setStatus("ready");
      } catch (caughtError) {
        if (!isMounted) {
          return;
        }

        setError(toError(caughtError));
        setStatus("error");
      }
    }

    void initializeSQLite();

    return () => {
      isMounted = false;
      dbRef.current?.close();
      dbRef.current = null;
    };
  }, []);

  const execute = useCallback((sql: string) => {
    const currentDb = dbRef.current;

    if (!currentDb) {
      throw new Error("SQLite non e ancora pronto.");
    }

    const result = currentDb.exec(sql);
    setVersion((currentVersion) => currentVersion + 1);
    return result;
  }, []);

  const resetDatabase = useCallback(() => {
    if (!SQL) {
      return;
    }

    dbRef.current?.close();

    const nextDb = createDatabase(SQL);
    dbRef.current = nextDb;
    setDb(nextDb);
    setError(null);
    setStatus("ready");
    setVersion((currentVersion) => currentVersion + 1);
  }, [SQL]);

  const value = useMemo<SQLiteContextValue>(
    () => ({
      SQL,
      db,
      error,
      status,
      version,
      execute,
      resetDatabase,
    }),
    [SQL, db, error, status, version, execute, resetDatabase],
  );

  return <SQLiteContext.Provider value={value}>{children}</SQLiteContext.Provider>;
}

export function useSQLite() {
  const context = useContext(SQLiteContext);

  if (!context) {
    throw new Error("useSQLite deve essere usato dentro SQLiteProvider.");
  }

  return context;
}
