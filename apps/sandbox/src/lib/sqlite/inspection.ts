import type { Database as SQLiteDatabase, SqlValue } from "sql.js";

export type SQLiteTableInfo = {
  name: string;
  rows: number;
};

export type SQLiteTablePreview = {
  columns: string[];
  rows: SqlValue[][];
};

export type SQLiteColumnInfo = {
  name: string;
  notNull: boolean;
  primaryKey: boolean;
  type: string;
};

export function readTables(db: SQLiteDatabase): SQLiteTableInfo[] {
  const result = db.exec(`
    SELECT name
    FROM sqlite_schema
    WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
    ORDER BY name COLLATE NOCASE
  `);

  return (
    result[0]?.values.map(([name]) => {
      const tableName = String(name);

      return {
        name: tableName,
        rows: readRowCount(db, tableName),
      };
    }) ?? []
  );
}

export function readSchema(db: SQLiteDatabase, tableName: string): SQLiteColumnInfo[] {
  const result = db.exec(`PRAGMA table_info(${quoteIdentifier(tableName)})`);

  return (
    result[0]?.values.map((row) => ({
      name: String(row[1]),
      type: String(row[2] ?? ""),
      notNull: row[3] === 1,
      primaryKey: Number(row[5]) > 0,
    })) ?? []
  );
}

export function readPreview(db: SQLiteDatabase, tableName: string): SQLiteTablePreview | null {
  const result = db.exec(`SELECT * FROM ${quoteIdentifier(tableName)} LIMIT 50`);
  const preview = result[0];

  return preview ? { columns: preview.columns, rows: preview.values } : null;
}

function readRowCount(db: SQLiteDatabase, tableName: string) {
  const result = db.exec(`SELECT COUNT(*) FROM ${quoteIdentifier(tableName)}`);

  return Number(result[0]?.values[0]?.[0] ?? 0);
}

function quoteIdentifier(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}
