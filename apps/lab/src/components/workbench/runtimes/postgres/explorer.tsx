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
    <DatabaseExplorerLayout
      description="Tabelle PostgreSQL"
      error={error}
      loading={loading}
      rowCountLabel={formatPostgresRowCount}
      selectedTableName={selectedTableName}
      tables={tables}
      onSelectTable={setSelectedTableName}
    >
      {selectedTable ? (
        <div className="space-y-4">
          <DatabaseTableSummaryCard rowCountLabel={formatPostgresRowCount} table={selectedTable} />
          <SchemaCard columns={explorerData.columns} />
          <PreviewCard preview={explorerData.preview} />
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
