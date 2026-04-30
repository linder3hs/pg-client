import { NextResponse } from 'next/server'
import { testConnection } from '@/lib/db/pool'
import type { ConnectionConfig } from '@/types/connection'

export async function POST(req: Request) {
  const body: ConnectionConfig = await req.json()
  const result = await testConnection(body)
  return NextResponse.json(result)
}
