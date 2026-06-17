import type { SqlValue } from "sql.js";

export function formatSQLiteValue(value: SqlValue) {
  if (value === null) {
    return "NULL";
  }

  if (value instanceof Uint8Array) {
    return `BLOB (${value.byteLength} byte)`;
  }

  return String(value);
}

export function formatSQLiteRowCount(count: number) {
  return count === 1 ? "1 riga" : `${count} righe`;
}
