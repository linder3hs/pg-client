import { Pool } from 'pg'
import type { TableInfo, Column } from '@/types/schema'

export async function listDatabases(pool: Pool): Promise<string[]> {
  const { rows } = await pool.query<{ datname: string }>(
    `SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY datname`
  )
  return rows.map((r) => r.datname)
}

export async function listSchemas(pool: Pool, database: string): Promise<string[]> {
  const client = await pool.connect()
  try {
    await client.query(`SET search_path TO information_schema`)
    const { rows } = await client.query<{ schema_name: string }>(
      `SELECT schema_name FROM information_schema.schemata WHERE catalog_name = $1 ORDER BY schema_name`,
      [database]
    )
    return rows.map((r) => r.schema_name)
  } finally {
    client.release()
  }
}

export async function listTables(pool: Pool, schema: string): Promise<TableInfo[]> {
  const { rows } = await pool.query<{ table_name: string; table_type: string }>(
    `SELECT table_name, table_type FROM information_schema.tables WHERE table_schema = $1 ORDER BY table_name`,
    [schema]
  )
  return rows.map((r) => ({ name: r.table_name, type: r.table_type }))
}

export async function getTableDetail(
  pool: Pool,
  schema: string,
  table: string
): Promise<{ columns: Column[]; rowCount: number | null }> {
  const { rows: colRows } = await pool.query<{
    column_name: string
    data_type: string
    is_nullable: string
    column_default: string | null
  }>(
    `SELECT column_name, data_type, is_nullable, column_default
     FROM information_schema.columns
     WHERE table_schema = $1 AND table_name = $2
     ORDER BY ordinal_position`,
    [schema, table]
  )
  const columns: Column[] = colRows.map((r) => ({
    name: r.column_name,
    dataType: r.data_type,
    isNullable: r.is_nullable === 'YES',
    columnDefault: r.column_default,
  }))

  let rowCount: number | null = null
  try {
    const client = await pool.connect()
    try {
      await client.query(`SET statement_timeout = 2000`)
      const { rows } = await client.query<{ count: string }>(
        `SELECT COUNT(*) as count FROM ${JSON.stringify(schema)}.${JSON.stringify(table)}`
      )
      rowCount = parseInt(rows[0].count, 10)
    } finally {
      client.release()
    }
  } catch {
    // timeout or permission error — rowCount stays null
  }

  return { columns, rowCount }
}
