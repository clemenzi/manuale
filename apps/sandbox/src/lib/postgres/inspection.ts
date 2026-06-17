import type { PGliteInterface } from "@electric-sql/pglite";

export type PostgresTableInfo = {
  name: string;
  rows: number;
};

export type PostgresTablePreview = {
  columns: string[];
  rows: unknown[][];
};

export type PostgresColumnInfo = {
  name: string;
  notNull: boolean;
  primaryKey: boolean;
  type: string;
};

export async function readPostgresTables(db: PGliteInterface): Promise<PostgresTableInfo[]> {
  const result = await db.query<{ name: string }>(`
    SELECT table_name AS name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);

  return Promise.all(
    result.rows.map(async ({ name }) => ({
      name,
      rows: await readRowCount(db, name),
    })),
  );
}

export async function readPostgresSchema(
  db: PGliteInterface,
  tableName: string,
): Promise<PostgresColumnInfo[]> {
  const result = await db.query<{
    name: string;
    not_null: boolean;
    primary_key: boolean;
    type: string;
  }>(
    `
      SELECT
        attribute.attname AS name,
        attribute.attnotnull AS not_null,
        EXISTS (
          SELECT 1
          FROM pg_index
          WHERE pg_index.indrelid = relation.oid
            AND pg_index.indisprimary
            AND attribute.attnum = ANY(pg_index.indkey)
        ) AS primary_key,
        pg_catalog.format_type(attribute.atttypid, attribute.atttypmod) AS type
      FROM pg_catalog.pg_attribute AS attribute
      JOIN pg_catalog.pg_class AS relation ON relation.oid = attribute.attrelid
      JOIN pg_catalog.pg_namespace AS namespace ON namespace.oid = relation.relnamespace
      WHERE namespace.nspname = 'public'
        AND relation.relname = $1
        AND attribute.attnum > 0
        AND NOT attribute.attisdropped
      ORDER BY attribute.attnum
    `,
    [tableName],
  );

  return result.rows.map((column) => ({
    name: column.name,
    type: column.type,
    notNull: column.not_null,
    primaryKey: column.primary_key,
  }));
}

export async function readPostgresPreview(
  db: PGliteInterface,
  tableName: string,
): Promise<PostgresTablePreview> {
  const result = await db.query(
    `SELECT * FROM ${quotePostgresIdentifier(tableName)} LIMIT 50`,
    [],
    {
      rowMode: "array",
    },
  );

  return {
    columns: result.fields.map((field) => field.name),
    rows: result.rows as unknown[][],
  };
}

async function readRowCount(db: PGliteInterface, tableName: string) {
  const result = await db.query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM ${quotePostgresIdentifier(tableName)}`,
  );

  return Number(result.rows[0]?.count ?? 0);
}

export function quotePostgresIdentifier(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}
