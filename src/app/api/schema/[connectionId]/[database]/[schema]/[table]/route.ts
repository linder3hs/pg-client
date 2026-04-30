import { NextResponse } from 'next/server'
import { getConnection } from '@/lib/db/connections'
import { getPool } from '@/lib/db/pool'
import { getTableDetail } from '@/lib/db/queries'

export async function GET(
  _req: Request,
  {
    params,
  }: {
    params: Promise<{ connectionId: string; database: string; schema: string; table: string }>
  }
) {
  const { connectionId, database, schema, table } = await params
  const conn = getConnection(connectionId)
  if (!conn) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  try {
    const pool = getPool({ ...conn, database })
    const detail = await getTableDetail(pool, schema, table)
    return NextResponse.json(detail)
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
