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
import { usePostgres } from "#/contexts/postgres";
import { formatPostgresRowCount, formatPostgresValue } from "#/lib/postgres/format";
import {
  readPostgresPreview,
  readPostgresSchema,
  readPostgresTables,
  type PostgresColumnInfo,
  type PostgresTableInfo,
  type PostgresTablePreview,
} from "#/lib/postgres/inspection";
import { cn } from "#/lib/utils.ts";
import { useEffect, useState } from "react";

type PostgresExplorerData = {
  columns: PostgresColumnInfo[];
  preview: PostgresTablePreview | null;
};

type LoadState = {
  error: string | null;
  loading: boolean;
};

const EMPTY_EXPLORER_DATA: PostgresExplorerData = {
  columns: [],
  preview: null,
};

const IDLE_LOAD_STATE: LoadState = {
  error: null,
  loading: false,
};

function toErrorMessage(caughtError: unknown) {
  return caughtError instanceof Error
    ? caughtError.message
    : "Impossibile aggiornare l'explorer PostgreSQL.";
}

function getNextSelectedTableName(currentName: string | null, tables: PostgresTableInfo[]) {
  if (currentName && tables.some((table) => table.name === currentName)) {
    return currentName;
  }

  return tables[0]?.name ?? null;
}

export function PostgresExplorer() {
  const { db, version } = usePostgres();
  const [tables, setTables] = useState<PostgresTableInfo[]>([]);
  const [selectedTableName, setSelectedTableName] = useState<string | null>(null);
  const [explorerData, setExplorerData] = useState<PostgresExplorerData>(EMPTY_EXPLORER_DATA);
  const [{ error, loading }, setLoadState] = useState<LoadState>(IDLE_LOAD_STATE);

  useEffect(() => {
    let isCurrent = true;

    async function loadTables() {
      if (!db) {
        setTables([]);
        setSelectedTableName(null);
        setLoadState(IDLE_LOAD_STATE);
        return;
      }

      setLoadState({ loading: true, error: null });

      try {
        const nextTables = await readPostgresTables(db);

        if (isCurrent) {
          setTables(nextTables);
          setSelectedTableName((currentName) => getNextSelectedTableName(currentName, nextTables));
          setLoadState(IDLE_LOAD_STATE);
        }
      } catch (caughtError) {
        if (isCurrent) {
          setLoadState({
            loading: false,
            error: toErrorMessage(caughtError),
          });
        }
      }
    }

    void loadTables();

    return () => {
      isCurrent = false;
    };
  }, [db, version]);

  useEffect(() => {
    let isCurrent = true;

    async function loadExplorerData() {
      if (!db || !selectedTableName) {
        setExplorerData(EMPTY_EXPLORER_DATA);
        setLoadState(IDLE_LOAD_STATE);
        return;
      }

      try {
        const [columns, preview] = await Promise.all([
          readPostgresSchema(db, selectedTableName),
          readPostgresPreview(db, selectedTableName),
        ]);

        if (isCurrent) {
          setExplorerData({ columns, preview });
          setLoadState((currentState) =>
            currentState.error === null ? currentState : IDLE_LOAD_STATE,
          );
        }
      } catch (caughtError) {
        if (isCurrent) {
          setExplorerData(EMPTY_EXPLORER_DATA);
          setLoadState({
            loading: false,
            error: toErrorMessage(caughtError),
          });
        }
      }
    }

    void loadExplorerData();

    return () => {
      isCurrent = false;
    };
  }, [db, selectedTableName, version]);

  const selectedTable = tables.find((table) => table.name === selectedTableName) ?? null;

  return (
    <div className="bg-accent h-[calc(100vh-70px)] overflow-hidden">
      <div className="border-b px-4 py-3">
        <h2 className="font-bold">Explorer</h2>
        <p className="text-sm text-muted-foreground">Tabelle PostgreSQL</p>
      </div>

      <div className="grid h-[calc(100%-61px)] grid-cols-[220px_minmax(0,1fr)]">
        <aside className="border-r p-2">
          <div className="flex h-full flex-col gap-1 overflow-y-auto">
            {loading && tables.length === 0 ? (
              <EmptyState label="Caricamento..." />
            ) : tables.length === 0 ? (
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
                    {formatPostgresRowCount(table.rows)}
                  </span>
                </Button>
              ))
            )}
          </div>
        </aside>

        <section className="min-w-0 overflow-y-auto p-4">
          {error ? (
            <EmptyState label={error} />
          ) : selectedTable ? (
            <div className="space-y-4">
              <Card size="sm">
                <CardHeader>
                  <CardTitle className="truncate">{selectedTable.name}</CardTitle>
                  <CardDescription>{formatPostgresRowCount(selectedTable.rows)}</CardDescription>
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

function SchemaCard({ columns }: { columns: PostgresColumnInfo[] }) {
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
                  <p className="text-xs text-muted-foreground">{column.type}</p>
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

function PreviewCard({ preview }: { preview: PostgresTablePreview | null }) {
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
                      <span className="font-mono text-xs">{formatPostgresValue(value)}</span>
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
