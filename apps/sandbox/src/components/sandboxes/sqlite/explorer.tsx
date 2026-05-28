import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table";
import { cn } from "#/lib/utils";
import { Database, Table2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { SqlValue } from "sql.js";
import { useSQLite } from "#/contexts/sqlite";
import {
  readPreview,
  readSchema,
  readTables,
  type SQLiteColumnInfo,
} from "#/lib/sqlite/inspection";
import { SQLiteValue } from "./value";

export function SQLiteExplorer() {
  const { db, version } = useSQLite();
  const tables = useMemo(() => {
    void version;
    return db ? readTables(db) : [];
  }, [db, version]);
  const [tableName, setTableName] = useState<string | null>(null);

  useEffect(() => {
    if (!tableName || !tables.some((table) => table.name === tableName)) {
      setTableName(tables[0]?.name ?? null);
    }
  }, [tableName, tables]);

  const schema = useMemo(() => {
    void version;
    return db && tableName ? readSchema(db, tableName) : [];
  }, [db, tableName, version]);

  const preview = useMemo(() => {
    void version;
    return db && tableName ? readPreview(db, tableName) : null;
  }, [db, tableName, version]);
  const selectedTable = useMemo(
    () => tables.find((table) => table.name === tableName),
    [tables, tableName],
  );

  return (
    <aside className="flex h-full min-w-0 flex-col bg-background">
      <header className="flex py-2.5 shrink-0 items-center border-b px-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <Database className="size-4 text-primary" />
          <h2 className="truncate text-sm font-medium">Explorer</h2>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[180px_minmax(0,1fr)]">
        <nav aria-label="Tabelle SQLite" className="min-h-0 overflow-auto border-r p-2">
          {tables.length === 0 ? (
            <Empty>Nessuna tabella</Empty>
          ) : (
            tables.map((table) => (
              <button
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted",
                  table.name === tableName && "bg-muted font-medium",
                )}
                key={table.name}
                onClick={() => setTableName(table.name)}
                aria-pressed={table.name === tableName}
                type="button"
              >
                <Table2 className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate">{table.name}</span>
                <span className="text-xs text-muted-foreground">{table.rows}</span>
              </button>
            ))
          )}
        </nav>

        <div className="min-h-0 overflow-auto p-3">
          {!tableName ? (
            <Empty>Seleziona una tabella</Empty>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="truncate text-base font-semibold">{tableName}</h3>
                <p className="text-xs text-muted-foreground">{selectedTable?.rows ?? 0} righe</p>
              </div>

              <Schema columns={schema} />

              <DataPreview columns={preview?.columns ?? []} rows={preview?.rows ?? []} />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function Schema({ columns }: { columns: SQLiteColumnInfo[] }) {
  return (
    <section>
      <h3 className="mb-2 text-sm font-medium">Schema</h3>
      <div className="divide-y rounded-md border">
        {columns.length === 0 && <Empty>Nessuna colonna</Empty>}

        {columns.map((column) => (
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 px-3 py-2" key={column.name}>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{column.name}</p>
              <p className="font-mono text-xs text-muted-foreground">{column.type || "-"}</p>
            </div>

            <div className="flex items-start gap-1">
              {column.primaryKey && <Tag>PK</Tag>}
              {column.notNull && <Tag>NN</Tag>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function DataPreview({ columns, rows }: { columns: string[]; rows: SqlValue[][] }) {
  return (
    <section>
      <h3 className="mb-2 text-sm font-medium">Dati</h3>
      <div className="overflow-hidden rounded-md border">
        {columns.length === 0 ? (
          <Empty>Nessun dato</Empty>
        ) : (
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-10 text-muted-foreground">#</TableHead>
                {columns.map((column) => (
                  <TableHead key={column}>{column}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    className="h-16 text-center text-muted-foreground"
                    colSpan={columns.length + 1}
                  >
                    Nessun dato
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    <TableCell className="text-xs text-muted-foreground">{rowIndex + 1}</TableCell>
                    {columns.map((column, cellIndex) => (
                      <TableCell
                        className="max-w-56 overflow-hidden text-ellipsis"
                        key={`${rowIndex}-${column}-${cellIndex}`}
                      >
                        <SQLiteValue value={row[cellIndex]} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </section>
  );
}

function Tag({ children }: { children: string }) {
  return (
    <span className="rounded border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
      {children}
    </span>
  );
}

function Empty({ children }: { children: string }) {
  return (
    <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
