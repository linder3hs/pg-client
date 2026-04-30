import { NextResponse } from 'next/server'
import { getConnection } from '@/lib/db/connections'
import { getPool } from '@/lib/db/pool'
import { listTables } from '@/lib/db/queries'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ connectionId: string; database: string; schema: string }> }
) {
  const { connectionId, database, schema } = await params
  const conn = getConnection(connectionId)
  if (!conn) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  try {
    const pool = getPool({ ...conn, database })
    const tables = await listTables(pool, schema)
    return NextResponse.json(tables)
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
