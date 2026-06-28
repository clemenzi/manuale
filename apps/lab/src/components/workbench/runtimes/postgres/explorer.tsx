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
import { useEffect, useState } from "react";
import {
  DatabaseExplorerLayout,
  DatabasePreviewCard,
  DatabaseSchemaCard,
  DatabaseTableSummaryCard,
  ExplorerEmptyState,
  getNextSelectedTableName,
} from "../database-explorer";

type PostgresExplorerData = {
  columns: PostgresColumnInfo[];
  preview: PostgresTablePreview | null;
};

type AsyncState<T> = {
  data: T;
  error: string | null;
  loading: boolean;
};

const EMPTY_EXPLORER_DATA: PostgresExplorerData = {
  columns: [],
  preview: null,
};

const EMPTY_TABLES_STATE: AsyncState<PostgresTableInfo[]> = {
  data: [],
  error: null,
  loading: false,
};

const EMPTY_EXPLORER_STATE: AsyncState<PostgresExplorerData> = {
  data: EMPTY_EXPLORER_DATA,
  error: null,
  loading: false,
};

function toErrorMessage(caughtError: unknown) {
  return caughtError instanceof Error
    ? caughtError.message
    : "Impossibile aggiornare l'explorer PostgreSQL.";
}

export function PostgresExplorer() {
  const { db, version } = usePostgres();
  const [selectedTableName, setSelectedTableName] = useState<string | null>(null);
  const [tablesState, setTablesState] = useState(EMPTY_TABLES_STATE);
  const [explorerState, setExplorerState] = useState(EMPTY_EXPLORER_STATE);
  const tables = tablesState.data;

  useEffect(() => {
    let isCurrent = true;

    async function loadTables() {
      if (!db) {
        setTablesState(EMPTY_TABLES_STATE);
        return;
      }

      setTablesState((currentState) => ({
        ...currentState,
        error: null,
        loading: true,
      }));

      try {
        const nextTables = await readPostgresTables(db);

        if (isCurrent) {
          setTablesState({ data: nextTables, error: null, loading: false });
        }
      } catch (caughtError) {
        if (isCurrent) {
          setTablesState({
            data: [],
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

  const activeTableName = getNextSelectedTableName(selectedTableName, tables);

  useEffect(() => {
    let isCurrent = true;

    async function loadExplorerData() {
      if (!db || !activeTableName) {
        setExplorerState(EMPTY_EXPLORER_STATE);
        return;
      }

      setExplorerState((currentState) => ({
        ...currentState,
        error: null,
        loading: true,
      }));

      try {
        const [columns, preview] = await Promise.all([
          readPostgresSchema(db, activeTableName),
          readPostgresPreview(db, activeTableName),
        ]);

        if (isCurrent) {
          setExplorerState({
            data: { columns, preview },
            error: null,
            loading: false,
          });
        }
      } catch (caughtError) {
        if (isCurrent) {
          setExplorerState({
            data: EMPTY_EXPLORER_DATA,
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
  }, [activeTableName, db, version]);

  const selectedTable = tables.find((table) => table.name === activeTableName) ?? null;
  const error = tablesState.error ?? explorerState.error;
  const loading = tablesState.loading || explorerState.loading;

  return (
    <DatabaseExplorerLayout
      description="Tabelle PostgreSQL"
      error={error}
      loading={loading}
      rowCountLabel={formatPostgresRowCount}
      selectedTableName={activeTableName}
      tables={tables}
      onSelectTable={setSelectedTableName}
    >
      {selectedTable ? (
        <div className="space-y-4">
          <DatabaseTableSummaryCard rowCountLabel={formatPostgresRowCount} table={selectedTable} />
          <SchemaCard columns={explorerState.data.columns} />
          <PreviewCard preview={explorerState.data.preview} />
        </div>
      ) : (
        <ExplorerEmptyState label="Seleziona una tabella" />
      )}
    </DatabaseExplorerLayout>
  );
}

function SchemaCard({ columns }: { columns: PostgresColumnInfo[] }) {
  return <DatabaseSchemaCard columns={columns} />;
}

function PreviewCard({ preview }: { preview: PostgresTablePreview | null }) {
  return <DatabasePreviewCard formatValue={formatPostgresValue} preview={preview} />;
}
