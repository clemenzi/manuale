import { useSQLite } from "#/contexts/sqlite";
import { formatSQLiteRowCount, formatSQLiteValue } from "#/lib/sqlite/format";
import {
  readPreview,
  readSchema,
  readTables,
  type SQLiteColumnInfo,
  type SQLiteTableInfo,
} from "#/lib/sqlite/inspection";
import { useMemo, useState } from "react";
import type { SQLiteTablePreview } from "#/lib/sqlite/inspection";
import {
  DatabaseExplorerLayout,
  DatabasePreviewCard,
  DatabaseSchemaCard,
  DatabaseTableSummaryCard,
  ExplorerEmptyState,
  getNextSelectedTableName,
} from "../database-explorer";

type SQLiteExplorerData = {
  columns: SQLiteColumnInfo[];
  preview: SQLiteTablePreview | null;
};

export function SQLiteExplorer() {
  const { db, version } = useSQLite();
  const [selectedTableName, setSelectedTableName] = useState<string | null>(null);

  const tables = useMemo<SQLiteTableInfo[]>(() => {
    void version;
    return db ? readTables(db) : [];
  }, [db, version]);
  const activeTableName = getNextSelectedTableName(selectedTableName, tables);
  const selectedTable = tables.find((table) => table.name === activeTableName) ?? null;

  const explorerData = useMemo<SQLiteExplorerData>(() => {
    void version;

    if (!db || !activeTableName) {
      return {
        columns: [],
        preview: null,
      };
    }

    return {
      columns: readSchema(db, activeTableName),
      preview: readPreview(db, activeTableName),
    };
  }, [activeTableName, db, version]);

  return (
    <DatabaseExplorerLayout
      description="Tabelle SQLite"
      rowCountLabel={formatSQLiteRowCount}
      selectedTableName={activeTableName}
      tables={tables}
      onSelectTable={setSelectedTableName}
    >
      {selectedTable ? (
        <div className="space-y-4">
          <DatabaseTableSummaryCard rowCountLabel={formatSQLiteRowCount} table={selectedTable} />
          <SchemaCard columns={explorerData.columns} />
          <PreviewCard preview={explorerData.preview} />
        </div>
      ) : (
        <ExplorerEmptyState label="Seleziona una tabella" />
      )}
    </DatabaseExplorerLayout>
  );
}

function SchemaCard({ columns }: { columns: SQLiteColumnInfo[] }) {
  return (
    <DatabaseSchemaCard
      columns={columns}
      formatColumnType={(column) => column.type || "Senza tipo"}
    />
  );
}

function PreviewCard({ preview }: { preview: SQLiteTablePreview | null }) {
  return <DatabasePreviewCard formatValue={formatSQLiteValue} preview={preview} />;
}
