import { NextResponse } from 'next/server'
import { getConnection } from '@/lib/db/connections'
import { getPool } from '@/lib/db/pool'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ connectionId: string }> }
) {
  const { connectionId } = await params
  const conn = getConnection(connectionId)
  if (!conn) return NextResponse.json({ error: 'Connection not found' }, { status: 404 })

  const { name } = await req.json() as { name: string }
  if (!name?.trim()) return NextResponse.json({ error: 'Database name is required' }, { status: 400 })

  if (!/^[a-zA-Z_][a-zA-Z0-9_$]*$/.test(name)) {
    return NextResponse.json({ error: 'Invalid database name' }, { status: 400 })
  }

  // CREATE DATABASE must run outside a transaction — use a direct client
  const pool = getPool(conn)
  const client = await pool.connect()
  try {
    await client.query(`CREATE DATABASE "${name.replace(/"/g, '""')}"`)
    return NextResponse.json({ ok: true, name })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  } finally {
    client.release()
  }
}
