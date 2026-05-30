import { DataTable } from "#/components/workbench/data-table";
import { EntityExplorer, type EntityExplorerItem } from "#/components/workbench/entity-explorer";
import { FieldList } from "#/components/workbench/field-list";
import { useSQLite } from "#/contexts/sqlite";
import {
  readPreview,
  readSchema,
  readTables,
  type SQLiteColumnInfo,
} from "#/lib/sqlite/inspection";
import { Database, Table2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { SqlValue } from "sql.js";
import { SQLiteValue } from "./value";

type SQLiteTableItem = EntityExplorerItem & {
  rows: number;
};

export function SQLiteExplorer() {
  const { db, version } = useSQLite();
  const [tableName, setTableName] = useState<string | null>(null);
  const tables = useMemo<SQLiteTableItem[]>(() => {
    void version;
    return db
      ? readTables(db).map((table) => ({
          id: table.name,
          label: table.name,
          meta: table.rows,
          rows: table.rows,
        }))
      : [];
  }, [db, version]);

  const schema = useMemo(() => {
    void version;
    return db && tableName ? readSchema(db, tableName) : [];
  }, [db, tableName, version]);

  const preview = useMemo(() => {
    void version;
    return db && tableName ? readPreview(db, tableName) : null;
  }, [db, tableName, version]);

  return (
    <EntityExplorer
      emptyLabel="Nessuna tabella"
      icon={<Database className="size-4 text-primary" />}
      items={tables}
      navLabel="Tabelle SQLite"
      renderDetails={(table) => (
        <SQLiteTableDetails
          columns={schema}
          previewColumns={preview?.columns ?? []}
          previewRows={preview?.rows ?? []}
          table={table}
        />
      )}
      renderItemIcon={() => <Table2 className="size-4 shrink-0 text-muted-foreground" />}
      selectedId={tableName}
      selectPrompt="Seleziona una tabella"
      title="Explorer"
      onSelectedIdChange={setTableName}
    />
  );
}

function SQLiteTableDetails({
  columns,
  previewColumns,
  previewRows,
  table,
}: {
  columns: SQLiteColumnInfo[];
  previewColumns: string[];
  previewRows: SqlValue[][];
  table: SQLiteTableItem | null;
}) {
  if (!table) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="truncate text-base font-semibold">{table.label}</h3>
        <p className="text-xs text-muted-foreground">{table.rows} righe</p>
      </div>

      <FieldList
        emptyLabel="Nessuna colonna"
        fields={columns.map((column) => ({
          id: column.name,
          label: column.name,
          description: column.type || "-",
          tags: [...(column.primaryKey ? ["PK"] : []), ...(column.notNull ? ["NN"] : [])],
        }))}
        title="Schema"
      />

      <DataTable
        columns={previewColumns}
        emptyLabel="Nessun dato"
        renderValue={(value) => <SQLiteValue value={value} />}
        rowNumberHeading="#"
        rows={previewRows}
        title="Dati"
      />
    </div>
  );
}
