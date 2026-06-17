export function formatPostgresValue(value: unknown) {
  if (value === null) {
    return "NULL";
  }

  if (value instanceof Uint8Array) {
    return `BYTEA (${value.byteLength} byte)`;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

export function formatPostgresRowCount(count: number) {
  return count === 1 ? "1 riga" : `${count} righe`;
}
