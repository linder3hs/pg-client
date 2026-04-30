'use client'
import { create } from 'zustand'
import type { Column, TableInfo } from '@/types/schema'

type NodeKey = string

interface SchemaCache {
  databases: Record<string, string[]>
  schemas: Record<NodeKey, string[]>
  tables: Record<NodeKey, TableInfo[]>
  columns: Record<NodeKey, { columns: Column[]; rowCount: number | null }>
}

interface SchemaStore {
  expanded: Set<string>
  cache: SchemaCache
  toggle: (key: string) => void
  setDatabases: (connectionId: string, dbs: string[]) => void
  setSchemas: (connectionId: string, database: string, schemas: string[]) => void
  setTables: (connectionId: string, database: string, schema: string, tables: TableInfo[]) => void
  setTableDetail: (
    connectionId: string,
    database: string,
    schema: string,
    table: string,
    detail: { columns: Column[]; rowCount: number | null }
  ) => void
  getDatabases: (connectionId: string) => string[] | undefined
  getSchemas: (connectionId: string, database: string) => string[] | undefined
  getTables: (connectionId: string, database: string, schema: string) => TableInfo[] | undefined
  getTableDetail: (
    connectionId: string,
    database: string,
    schema: string,
    table: string
  ) => { columns: Column[]; rowCount: number | null } | undefined
  invalidateDatabases: (connectionId: string) => void
  invalidateTables: (connectionId: string, database: string, schema: string) => void
}

export const useSchemaStore = create<SchemaStore>((set, get) => ({
  expanded: new Set(),
  cache: { databases: {}, schemas: {}, tables: {}, columns: {} },

  toggle: (key) =>
    set((s) => {
      const next = new Set(s.expanded)
      next.has(key) ? next.delete(key) : next.add(key)
      return { expanded: next }
    }),

  setDatabases: (connectionId, dbs) =>
    set((s) => ({ cache: { ...s.cache, databases: { ...s.cache.databases, [connectionId]: dbs } } })),

  setSchemas: (connectionId, database, schemas) =>
    set((s) => ({
      cache: {
        ...s.cache,
        schemas: { ...s.cache.schemas, [`${connectionId}/${database}`]: schemas },
      },
    })),

  setTables: (connectionId, database, schema, tables) =>
    set((s) => ({
      cache: {
        ...s.cache,
        tables: { ...s.cache.tables, [`${connectionId}/${database}/${schema}`]: tables },
      },
    })),

  setTableDetail: (connectionId, database, schema, table, detail) =>
    set((s) => ({
      cache: {
        ...s.cache,
        columns: {
          ...s.cache.columns,
          [`${connectionId}/${database}/${schema}/${table}`]: detail,
        },
      },
    })),

  getDatabases: (connectionId) => get().cache.databases[connectionId],
  getSchemas: (connectionId, database) => get().cache.schemas[`${connectionId}/${database}`],
  getTables: (connectionId, database, schema) =>
    get().cache.tables[`${connectionId}/${database}/${schema}`],
  getTableDetail: (connectionId, database, schema, table) =>
    get().cache.columns[`${connectionId}/${database}/${schema}/${table}`],

  invalidateDatabases: (connectionId) =>
    set((s) => {
      const databases = { ...s.cache.databases }
      delete databases[connectionId]
      return { cache: { ...s.cache, databases } }
    }),

  invalidateTables: (connectionId, database, schema) =>
    set((s) => {
      const tables = { ...s.cache.tables }
      delete tables[`${connectionId}/${database}/${schema}`]
      return { cache: { ...s.cache, tables } }
    }),
}))
