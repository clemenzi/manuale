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
import { cn } from "#/lib/utils";
import type { ReactNode } from "react";

export type DatabaseExplorerTableInfo = {
  name: string;
  rows: number;
};

export type DatabaseExplorerColumnInfo = {
  name: string;
  notNull: boolean;
  primaryKey: boolean;
  type: string;
};

export type DatabaseExplorerPreview = {
  columns: string[];
  rows: unknown[][];
};

type DatabaseExplorerLayoutProps = {
  children: ReactNode;
  description: string;
  error?: string | null;
  loading?: boolean;
  rowCountLabel: (rowCount: number) => string;
  selectedTableName: string | null;
  tables: DatabaseExplorerTableInfo[];
  title?: string;
  onSelectTable: (tableName: string) => void;
};

type DatabaseSchemaCardProps = {
  columns: DatabaseExplorerColumnInfo[];
  emptyLabel?: string;
  formatColumnType?: (column: DatabaseExplorerColumnInfo) => string;
};

type DatabasePreviewCardProps<TValue> = {
  preview: {
    columns: string[];
    rows: TValue[][];
  } | null;
  formatValue: (value: TValue) => string;
};

const DEFAULT_EMPTY_LABEL = "Nessuna colonna";
const DEFAULT_TITLE = "Explorer";

function defaultColumnTypeFormatter(column: DatabaseExplorerColumnInfo) {
  return column.type;
}

export function DatabaseExplorerLayout({
  children,
  description,
  error,
  loading = false,
  rowCountLabel,
  selectedTableName,
  tables,
  title = DEFAULT_TITLE,
  onSelectTable,
}: DatabaseExplorerLayoutProps) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-accent">
      <div className="shrink-0 border-b px-4 py-3">
        <h2 className="font-bold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[220px_minmax(0,1fr)]">
        <aside className="min-h-0 border-r p-2">
          <div className="flex h-full flex-col gap-1 overflow-y-auto">
            {loading && tables.length === 0 ? (
              <ExplorerEmptyState label="Caricamento..." />
            ) : tables.length === 0 ? (
              <ExplorerEmptyState label="Nessuna tabella" />
            ) : (
              tables.map((table) => (
                <Button
                  key={table.name}
                  className="justify-between"
                  size="sm"
                  variant={table.name === selectedTableName ? "secondary" : "ghost"}
                  onClick={() => onSelectTable(table.name)}
                >
                  <span className="truncate">{table.name}</span>
                  <span className="text-xs text-muted-foreground">{rowCountLabel(table.rows)}</span>
                </Button>
              ))
            )}
          </div>
        </aside>

        <section className="min-w-0 overflow-y-auto p-4">
          {error ? <ExplorerEmptyState label={error} /> : children}
        </section>
      </div>
    </div>
  );
}

export function DatabaseTableSummaryCard({
  rowCountLabel,
  table,
}: {
  rowCountLabel: (rowCount: number) => string;
  table: DatabaseExplorerTableInfo;
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="truncate">{table.name}</CardTitle>
        <CardDescription>{rowCountLabel(table.rows)}</CardDescription>
      </CardHeader>
    </Card>
  );
}

export function DatabaseSchemaCard({
  columns,
  emptyLabel = DEFAULT_EMPTY_LABEL,
  formatColumnType = defaultColumnTypeFormatter,
}: DatabaseSchemaCardProps) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Schema</CardTitle>
        <CardDescription>Colonne della tabella selezionata</CardDescription>
      </CardHeader>
      <CardContent>
        {columns.length === 0 ? (
          <ExplorerEmptyState label={emptyLabel} />
        ) : (
          <div className="space-y-2">
            {columns.map((column) => (
              <div
                key={column.name}
                className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{column.name}</p>
                  <p className="text-xs text-muted-foreground">{formatColumnType(column)}</p>
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

export function DatabasePreviewCard<TValue>({
  formatValue,
  preview,
}: DatabasePreviewCardProps<TValue>) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Dati</CardTitle>
        <CardDescription>Prime 50 righe</CardDescription>
      </CardHeader>
      <CardContent>
        {!preview || preview.columns.length === 0 ? (
          <ExplorerEmptyState label="Nessun dato" />
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
                      <span className="font-mono text-xs">{formatValue(value)}</span>
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

export function ExplorerEmptyState({ label }: { label: string }) {
  return <p className="py-6 text-center text-sm text-muted-foreground">{label}</p>;
}

export function getNextSelectedTableName(
  currentName: string | null,
  tables: DatabaseExplorerTableInfo[],
) {
  if (currentName && tables.some((table) => table.name === currentName)) {
    return currentName;
  }

  return tables[0]?.name ?? null;
}
