import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table";
import { useSQLite } from "#/contexts/sqlite";
import { formatSQLiteRowCount, formatSQLiteValue } from "#/lib/sqlite/format";
import {
  readPreview,
  readSchema,
  readTables,
  type SQLiteColumnInfo,
} from "#/lib/sqlite/inspection";
import { cn } from "#/lib/utils.ts";
import { useEffect, useMemo, useState } from "react";
import type { SQLiteTablePreview } from "#/lib/sqlite/inspection";

type SQLiteExplorerData = {
  columns: SQLiteColumnInfo[];
  preview: SQLiteTablePreview | null;
};

export function SQLiteExplorer() {
  const { db, version } = useSQLite();
  const [selectedTableName, setSelectedTableName] = useState<string | null>(null);

  const tables = useMemo(() => {
    void version;
    return db ? readTables(db) : [];
  }, [db, version]);

  useEffect(() => {
    if (tables.length === 0) {
      setSelectedTableName(null);
      return;
    }

    if (!selectedTableName || !tables.some((table) => table.name === selectedTableName)) {
      setSelectedTableName(tables[0]?.name ?? null);
    }
  }, [selectedTableName, tables]);

  const selectedTable = useMemo(
    () => tables.find((table) => table.name === selectedTableName) ?? null,
    [selectedTableName, tables],
  );

  const explorerData = useMemo<SQLiteExplorerData>(() => {
    void version;

    if (!db || !selectedTableName) {
      return {
        columns: [],
        preview: null,
      };
    }

    return {
      columns: readSchema(db, selectedTableName),
      preview: readPreview(db, selectedTableName),
    };
  }, [db, selectedTableName, version]);

  return (
    <div className="bg-accent h-[calc(100vh-70px)] overflow-hidden">
      <div className="border-b px-4 py-3">
        <h2 className="font-bold">Explorer</h2>
        <p className="text-sm text-muted-foreground">Tabelle SQLite</p>
      </div>

      <div className="grid h-[calc(100%-61px)] grid-cols-[220px_minmax(0,1fr)]">
        <aside className="border-r p-2">
          <div className="flex h-full flex-col gap-1 overflow-y-auto">
            {tables.length === 0 ? (
              <EmptyState label="Nessuna tabella" />
            ) : (
              tables.map((table) => (
                <Button
                  key={table.name}
                  className="justify-between"
                  size="sm"
                  variant={table.name === selectedTableName ? "secondary" : "ghost"}
                  onClick={() => setSelectedTableName(table.name)}
                >
                  <span className="truncate">{table.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatSQLiteRowCount(table.rows)}
                  </span>
                </Button>
              ))
            )}
          </div>
        </aside>

        <section className="min-w-0 overflow-y-auto p-4">
          {selectedTable ? (
            <div className="space-y-4">
              <Card size="sm">
                <CardHeader>
                  <CardTitle className="truncate">{selectedTable.name}</CardTitle>
                  <CardDescription>{formatSQLiteRowCount(selectedTable.rows)}</CardDescription>
                </CardHeader>
              </Card>

              <SchemaCard columns={explorerData.columns} />
              <PreviewCard preview={explorerData.preview} />
            </div>
          ) : (
            <EmptyState label="Seleziona una tabella" />
          )}
        </section>
      </div>
    </div>
  );
}

function SchemaCard({ columns }: { columns: SQLiteColumnInfo[] }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Schema</CardTitle>
        <CardDescription>Colonne della tabella selezionata</CardDescription>
      </CardHeader>
      <CardContent>
        {columns.length === 0 ? (
          <EmptyState label="Nessuna colonna" />
        ) : (
          <div className="space-y-2">
            {columns.map((column) => (
              <div
                key={column.name}
                className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{column.name}</p>
                  <p className="text-xs text-muted-foreground">{column.type || "Senza tipo"}</p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {column.primaryKey ? <Badge variant="outline">PK</Badge> : null}
                  {column.notNull ? <Badge variant="outline">NN</Badge> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PreviewCard({ preview }: { preview: SQLiteTablePreview | null }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Dati</CardTitle>
        <CardDescription>Prime 50 righe</CardDescription>
      </CardHeader>
      <CardContent>
        {!preview || preview.columns.length === 0 ? (
          <EmptyState label="Nessun dato" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {preview.columns.map((column) => (
                  <TableHead key={column}>{column}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {preview.rows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {row.map((value, valueIndex) => (
                    <TableCell
                      key={`${preview.columns[valueIndex]}-${rowIndex}`}
                      className={cn(value === null && "text-muted-foreground")}
                    >
                      <span className="font-mono text-xs">{formatSQLiteValue(value)}</span>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState({ label }: { label: string }) {
  return <p className="py-6 text-center text-sm text-muted-foreground">{label}</p>;
}
