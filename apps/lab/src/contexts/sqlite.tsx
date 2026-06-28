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

type SQLiteState =
  | { SQL: null; db: null; error: null; status: "loading" }
  | { SQL: SqlJsStatic; db: Database; error: null; status: "ready" }
  | { SQL: null; db: null; error: Error; status: "error" };

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
  const [{ SQL, db, error, status }, setState] = useState<SQLiteState>({
    SQL: null,
    db: null,
    error: null,
    status: "loading",
  });
  const [version, setVersion] = useState(0);

  const initializeSQLite = useCallback(async (isCurrent: () => boolean = () => true) => {
    try {
      setState({ SQL: null, db: null, error: null, status: "loading" });

      const SQLModule = await initSqlJs({
        locateFile: () => sqliteWasmUrl,
      });

      if (!isCurrent()) {
        return;
      }

      const nextDb = createDatabase(SQLModule);
      dbRef.current = nextDb;
      setVersion((currentVersion) => currentVersion + 1);
      setState({ SQL: SQLModule, db: nextDb, error: null, status: "ready" });
    } catch (caughtError) {
      if (!isCurrent()) {
        return;
      }

      setState({ SQL: null, db: null, error: toError(caughtError), status: "error" });
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    void initializeSQLite(() => isMounted);

    return () => {
      isMounted = false;
      dbRef.current?.close();
      dbRef.current = null;
    };
  }, [initializeSQLite]);

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
      void initializeSQLite();
      return;
    }

    dbRef.current?.close();

    const nextDb = createDatabase(SQL);
    dbRef.current = nextDb;
    setState({ SQL, db: nextDb, error: null, status: "ready" });
    setVersion((currentVersion) => currentVersion + 1);
  }, [SQL, initializeSQLite]);

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
