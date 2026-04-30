import { NextResponse } from 'next/server'
import { getConnection } from '@/lib/db/connections'
import { getPool } from '@/lib/db/pool'

interface QueryBody {
  connectionId: string
  database: string
  sql: string
}

export async function POST(req: Request) {
  const { connectionId, database, sql }: QueryBody = await req.json()

  const conn = getConnection(connectionId)
  if (!conn) return NextResponse.json({ error: 'Connection not found' }, { status: 404 })

  const pool = getPool({ ...conn, database })
  const client = await pool.connect()

  try {
    await client.query('SET statement_timeout = 30000')
    const start = Date.now()
    const result = await client.query(sql)
    const duration = Date.now() - start

    return NextResponse.json({
      rows: result.rows,
      fields: result.fields.map((f) => ({ name: f.name, dataTypeID: f.dataTypeID })),
      rowCount: result.rowCount ?? result.rows.length,
      duration,
    })
  } catch (err) {
    const e = err as { message: string; detail?: string; hint?: string; position?: string }
    return NextResponse.json(
      { error: e.message, detail: e.detail, hint: e.hint, position: e.position },
      { status: 400 }
    )
  } finally {
    client.release()
  }
}
