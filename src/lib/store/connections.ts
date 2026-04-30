'use client'
import { create } from 'zustand'
import type { ConnectionSafe } from '@/types/connection'

interface ConnectionsStore {
  connections: ConnectionSafe[]
  activeConnectionId: string | null
  loading: boolean
  setConnections: (conns: ConnectionSafe[]) => void
  setActiveConnection: (id: string | null) => void
  setLoading: (v: boolean) => void
  addConnection: (conn: ConnectionSafe) => void
  removeConnection: (id: string) => void
  updateConnection: (conn: ConnectionSafe) => void
}

export const useConnectionsStore = create<ConnectionsStore>((set) => ({
  connections: [],
  activeConnectionId: null,
  loading: false,
  setConnections: (connections) => set({ connections }),
  setActiveConnection: (id) => set({ activeConnectionId: id }),
  setLoading: (loading) => set({ loading }),
  addConnection: (conn) => set((s) => ({ connections: [...s.connections, conn] })),
  removeConnection: (id) =>
    set((s) => ({ connections: s.connections.filter((c) => c.id !== id) })),
  updateConnection: (conn) =>
    set((s) => ({ connections: s.connections.map((c) => (c.id === conn.id ? conn : c)) })),
}))
