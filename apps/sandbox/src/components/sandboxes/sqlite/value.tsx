import { formatSQLiteValue } from "#/lib/sqlite/format";
import type { SqlValue } from "sql.js";

type SQLiteValueProps = {
  value: SqlValue;
};

export function SQLiteValue({ value }: SQLiteValueProps) {
  if (value === null) {
    return <span className="text-muted-foreground italic">NULL</span>;
  }

  if (value instanceof Uint8Array) {
    return (
      <span className="font-mono text-xs text-muted-foreground">{formatSQLiteValue(value)}</span>
    );
  }

  return formatSQLiteValue(value);
}
