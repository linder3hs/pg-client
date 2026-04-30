import { Pool } from 'pg'
import type { Connection } from '@/types/connection'

const pools = new Map<string, Pool>()

export function getPool(connection: Connection): Pool {
  const key = `${connection.id}::${connection.database}`
  if (!pools.has(key)) {
    pools.set(
      key,
      new Pool({
        host: connection.host,
        port: connection.port,
        database: connection.database,
        user: connection.user,
        password: connection.password,
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      })
    )
  }
  return pools.get(key)!
}

export async function destroyPool(connectionId: string): Promise<void> {
  for (const [key, pool] of pools) {
    if (key.startsWith(`${connectionId}::`)) {
      await pool.end().catch(() => {})
      pools.delete(key)
    }
  }
}

export async function testConnection(
  config: Omit<Connection, 'id' | 'name' | 'createdAt'>
): Promise<{ ok: true } | { ok: false; error: string }> {
  const pool = new Pool({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    max: 1,
    connectionTimeoutMillis: 5000,
  })
  try {
    const client = await pool.connect()
    await client.query('SELECT 1')
    client.release()
    return { ok: true }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  } finally {
    await pool.end()
  }
}
