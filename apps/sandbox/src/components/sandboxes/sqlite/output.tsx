import { DataTable } from "#/components/workbench/data-table";
import { formatSQLiteRowCount } from "#/lib/sqlite/format";
import { CancelCircleIcon, CheckmarkCircle02Icon, DatabaseIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { QueryExecResult, SqlValue } from "sql.js";
import { SQLiteValue } from "./value";

type SQLiteOutputValue = QueryExecResult[] | Error;

type SQLiteOutputProps = {
  output?: SQLiteOutputValue;
};

export function SQLiteOutput({ output }: SQLiteOutputProps) {
  if (!output) {
    return (
      <section className="flex h-full items-center justify-center text-muted-foreground">
        <div className="flex items-center gap-2 text-sm">
          <HugeiconsIcon icon={DatabaseIcon} className="size-4" />
          <span>Nessun output</span>
        </div>
      </section>
    );
  }

  if (output instanceof Error) {
    return (
      <section
        role="alert"
        className="flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"
      >
        <HugeiconsIcon icon={CancelCircleIcon} className="mt-0.5 size-4 shrink-0" />
        <p className="min-w-0 break-words">{output.message}</p>
      </section>
    );
  }

  if (output.length === 0) {
    return (
      <section className="flex items-center gap-2 rounded-md border bg-muted/30 p-3 text-sm">
        <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 text-primary" />
        <span>Query eseguita.</span>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      {output.map((result, index) => (
        <QueryResult key={index} result={result} index={index} />
      ))}
    </section>
  );
}

function QueryResult({ result, index }: { result: QueryExecResult; index: number }) {
  return (
    <section className="overflow-hidden rounded-md border bg-card">
      <header className="flex items-center justify-between gap-3 border-b bg-muted/30 px-3 py-2 text-sm">
        <h2 className="font-medium">Risultato {index + 1}</h2>
        <span className="text-xs text-muted-foreground">
          {formatSQLiteRowCount(result.values.length)}
        </span>
      </header>

      <DataTable<SqlValue>
        bordered={false}
        columns={result.columns}
        emptyLabel="Nessun dato"
        renderValue={(value) => <SQLiteValue value={value} />}
        rows={result.values}
      />
    </section>
  );
}
