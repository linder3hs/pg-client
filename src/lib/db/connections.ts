import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import type { Connection, ConnectionConfig } from '@/types/connection'

const DATA_FILE = path.join(process.cwd(), 'data', 'connections.json')

function readAll(): Connection[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8')
    return JSON.parse(raw) as Connection[]
  } catch {
    return []
  }
}

function writeAll(connections: Connection[]): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(connections, null, 2), 'utf-8')
}

export function listConnections(): Connection[] {
  return readAll()
}

export function getConnection(id: string): Connection | undefined {
  return readAll().find((c) => c.id === id)
}

export function createConnection(config: ConnectionConfig): Connection {
  const connections = readAll()
  const conn: Connection = {
    ...config,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  }
  connections.push(conn)
  writeAll(connections)
  return conn
}

export function updateConnection(id: string, config: ConnectionConfig): Connection | null {
  const connections = readAll()
  const idx = connections.findIndex((c) => c.id === id)
  if (idx === -1) return null
  connections[idx] = { ...connections[idx], ...config }
  writeAll(connections)
  return connections[idx]
}

export function deleteConnection(id: string): boolean {
  const connections = readAll()
  const next = connections.filter((c) => c.id !== id)
  if (next.length === connections.length) return false
  writeAll(next)
  return true
}
