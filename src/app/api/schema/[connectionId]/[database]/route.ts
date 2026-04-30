import { NextResponse } from 'next/server'
import { getConnection } from '@/lib/db/connections'
import { getPool } from '@/lib/db/pool'
import { listSchemas } from '@/lib/db/queries'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ connectionId: string; database: string }> }
) {
  const { connectionId, database } = await params
  const conn = getConnection(connectionId)
  if (!conn) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  try {
    const pool = getPool({ ...conn, database })
    const schemas = await listSchemas(pool, database)
    return NextResponse.json(schemas)
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
