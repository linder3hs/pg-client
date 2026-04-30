import { NextResponse } from 'next/server'
import { getConnection } from '@/lib/db/connections'
import { getPool } from '@/lib/db/pool'
import { listDatabases } from '@/lib/db/queries'

export async function GET(_req: Request, { params }: { params: Promise<{ connectionId: string }> }) {
  const { connectionId } = await params
  const conn = getConnection(connectionId)
  if (!conn) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  try {
    const pool = getPool(conn)
    const databases = await listDatabases(pool)
    return NextResponse.json(databases)
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
