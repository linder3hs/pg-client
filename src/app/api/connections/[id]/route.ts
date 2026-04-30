import { NextResponse } from 'next/server'
import { getConnection, updateConnection, deleteConnection } from '@/lib/db/connections'
import { destroyPool } from '@/lib/db/pool'
import type { ConnectionConfig } from '@/types/connection'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const conn = getConnection(id)
  if (!conn) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const { password: _pw, ...safe } = conn
  return NextResponse.json(safe)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body: ConnectionConfig = await req.json()
  const conn = updateConnection(id, body)
  if (!conn) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await destroyPool(id)
  const { password: _pw, ...safe } = conn
  return NextResponse.json(safe)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const deleted = deleteConnection(id)
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await destroyPool(id)
  return NextResponse.json({ ok: true })
}
