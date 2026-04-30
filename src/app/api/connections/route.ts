import { NextResponse } from 'next/server'
import { listConnections, createConnection } from '@/lib/db/connections'
import type { ConnectionConfig } from '@/types/connection'

export async function GET() {
  const connections = listConnections().map(({ password: _pw, ...rest }) => rest)
  return NextResponse.json(connections)
}

export async function POST(req: Request) {
  const body: ConnectionConfig = await req.json()
  const conn = createConnection(body)
  const { password: _pw, ...safe } = conn
  return NextResponse.json(safe, { status: 201 })
}
