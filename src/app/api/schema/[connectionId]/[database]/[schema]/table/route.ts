import { NextResponse } from 'next/server'
import { getConnection } from '@/lib/db/connections'
import { getPool } from '@/lib/db/pool'

interface ColumnDef {
  name: string
  type: string
  nullable: boolean
  primaryKey: boolean
  defaultValue: string
}

function quoteIdent(s: string): string {
  return '"' + s.replace(/"/g, '""') + '"'
}

function buildSQL(schema: string, table: string, columns: ColumnDef[]): string {
  const pkCols = columns.filter((c) => c.primaryKey).map((c) => quoteIdent(c.name))
  const defs: string[] = columns.map((col) => {
    let def = `  ${quoteIdent(col.name)} ${col.type}`
    if (col.defaultValue.trim()) def += ` DEFAULT ${col.defaultValue.trim()}`
    if (!col.nullable || col.primaryKey) def += ' NOT NULL'
    return def
  })
  if (pkCols.length > 0) defs.push(`  PRIMARY KEY (${pkCols.join(', ')})`)
  return `CREATE TABLE ${quoteIdent(schema)}.${quoteIdent(table)} (\n${defs.join(',\n')}\n);`
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ connectionId: string; database: string; schema: string }> }
) {
  const { connectionId, database, schema } = await params
  const conn = getConnection(connectionId)
  if (!conn) return NextResponse.json({ error: 'Connection not found' }, { status: 404 })

  const { name, columns } = await req.json() as { name: string; columns: ColumnDef[] }
  if (!name?.trim()) return NextResponse.json({ error: 'Table name is required' }, { status: 400 })
  if (!columns?.length) return NextResponse.json({ error: 'At least one column is required' }, { status: 400 })

  const sql = buildSQL(schema, name.trim(), columns)

  try {
    const pool = getPool({ ...conn, database })
    await pool.query(sql)
    return NextResponse.json({ ok: true, name: name.trim(), sql })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
