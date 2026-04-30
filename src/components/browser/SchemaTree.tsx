'use client'
import { useState, useCallback } from 'react'
import { Database, Layers, Table2, Eye, Columns3, Search } from 'lucide-react'
import { TreeNode } from './TreeNode'
import { useSchemaStore } from '@/lib/store/schema'
import { useEditorStore } from '@/lib/store/editor'
import type { Column, TableInfo } from '@/types/schema'

interface Props { connectionId: string }

const SYSTEM_SCHEMAS = new Set(['information_schema', 'pg_catalog', 'pg_toast', 'pg_temp_1', 'pg_toast_temp_1'])

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`)
  return data as T
}

export function SchemaTree({ connectionId }: Props) {
  const store = useSchemaStore()
  const { activeTabId, updateTabSql, updateTabDatabase } = useEditorStore()
  const [loading, setLoading] = useState<Set<string>>(new Set())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [search, setSearch] = useState('')
  const [showSystem, setShowSystem] = useState(false)

  const setLoad = (key: string, v: boolean) =>
    setLoading((s) => { const n = new Set(s); v ? n.add(key) : n.delete(key); return n })
  const setErr = (key: string, msg: string | null) =>
    setErrors((s) => { const n = { ...s }; msg ? (n[key] = msg) : delete n[key]; return n })
  const isExpanded = (key: string) => store.expanded.has(key)

  async function fetchDatabases() {
    const key = connectionId
    if (Array.isArray(store.getDatabases(connectionId))) { store.toggle(key); return }
    setLoad(key, true); setErr(key, null)
    try {
      const dbs = await fetchJson<string[]>(`/api/schema/${connectionId}`)
      store.setDatabases(connectionId, dbs)
      store.toggle(key)
    } catch (e) { setErr(key, (e as Error).message) }
    finally { setLoad(key, false) }
  }

  async function fetchTables(db: string, schema: string) {
    const key = `${connectionId}/${db}/${schema}`
    if (Array.isArray(store.getTables(connectionId, db, schema))) { store.toggle(key); return }
    setLoad(key, true); setErr(key, null)
    try {
      const tables = await fetchJson<TableInfo[]>(
        `/api/schema/${connectionId}/${encodeURIComponent(db)}/${encodeURIComponent(schema)}`
      )
      store.setTables(connectionId, db, schema, tables)
      store.toggle(key)
    } catch (e) { setErr(key, (e as Error).message) }
    finally { setLoad(key, false) }
  }

  async function fetchSchemas(db: string) {
    const key = `${connectionId}/${db}`
    if (Array.isArray(store.getSchemas(connectionId, db))) { store.toggle(key); return }
    setLoad(key, true); setErr(key, null)
    try {
      const schemas = await fetchJson<string[]>(`/api/schema/${connectionId}/${encodeURIComponent(db)}`)
      store.setSchemas(connectionId, db, schemas)
      store.toggle(key)
      const firstUser = schemas.find((s) => !SYSTEM_SCHEMAS.has(s))
      if (firstUser && !store.expanded.has(`${connectionId}/${db}/${firstUser}`)) {
        fetchTables(db, firstUser)
      }
    } catch (e) { setErr(key, (e as Error).message) }
    finally { setLoad(key, false) }
  }

  async function fetchColumns(db: string, schema: string, table: string) {
    const key = `${connectionId}/${db}/${schema}/${table}`
    if (store.getTableDetail(connectionId, db, schema, table)) { store.toggle(key); return }
    setLoad(key, true); setErr(key, null)
    try {
      const detail = await fetchJson<{ columns: Column[]; rowCount: number | null }>(
        `/api/schema/${connectionId}/${encodeURIComponent(db)}/${encodeURIComponent(schema)}/${encodeURIComponent(table)}`
      )
      store.setTableDetail(connectionId, db, schema, table, detail)
      store.toggle(key)
    } catch (e) { setErr(key, (e as Error).message) }
    finally { setLoad(key, false) }
  }

  const insertSelect = useCallback((db: string, schema: string, table: string) => {
    if (!activeTabId) return
    updateTabSql(activeTabId, `SELECT *\nFROM "${schema}"."${table}"\nLIMIT 100;`)
    updateTabDatabase(activeTabId, db)
  }, [activeTabId, updateTabSql, updateTabDatabase])

  const rawDbs = store.getDatabases(connectionId)
  const databases = Array.isArray(rawDbs) ? rawDbs : undefined

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5 border-b border-[#1e1e1e]">
        <div className="flex items-center gap-2 bg-[#161616] border border-[#252525] rounded-lg px-2.5 py-1.5 focus-within:border-[#333] transition-colors">
          <Search size={12} className="text-[#555] shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tables…"
            className="w-full bg-transparent text-[13px] text-[#ccc] placeholder-[#4a4a4a] focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto py-1">
        <TreeNode
          label="Databases"
          depth={0}
          expanded={isExpanded(connectionId)}
          loading={loading.has(connectionId)}
          onToggle={fetchDatabases}
          icon={<Database size={13} className="text-[#555]" />}
        >
          {errors[connectionId] && <ErrRow msg={errors[connectionId]} depth={1} />}

          {databases?.map((db) => {
            const dbKey = `${connectionId}/${db}`
            const rawSchemas = store.getSchemas(connectionId, db)
            const schemas = Array.isArray(rawSchemas) ? rawSchemas : undefined
            return (
              <TreeNode key={db} label={db} depth={1}
                expanded={isExpanded(dbKey)} loading={loading.has(dbKey)}
                onToggle={() => fetchSchemas(db)}
                icon={<Database size={13} className="text-[#3a8a5a]" />}
              >
                {errors[dbKey] && <ErrRow msg={errors[dbKey]} depth={2} />}

                {schemas?.map((schema) => {
                  const isSystem = SYSTEM_SCHEMAS.has(schema)
                  if (isSystem && !showSystem && !search) return null
                  const schKey = `${connectionId}/${db}/${schema}`
                  const rawTables = store.getTables(connectionId, db, schema)
                  const allTables = Array.isArray(rawTables) ? rawTables : undefined
                  const tables = search
                    ? allTables?.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
                    : allTables

                  return (
                    <TreeNode key={schema} label={schema} depth={2} muted={isSystem}
                      expanded={isExpanded(schKey)} loading={loading.has(schKey)}
                      onToggle={() => fetchTables(db, schema)}
                      icon={<Layers size={12} className={isSystem ? 'text-[#333]' : 'text-[#4a6a8a]'} />}
                    >
                      {errors[schKey] && <ErrRow msg={errors[schKey]} depth={3} />}

                      {tables?.length === 0 && !loading.has(schKey) && (
                        <div className="text-xs text-[#444] italic py-1" style={{ paddingLeft: 10 + 3 * 16 }}>
                          no tables
                        </div>
                      )}

                      {tables?.map((t) => {
                        const tKey = `${connectionId}/${db}/${schema}/${t.name}`
                        const detail = store.getTableDetail(connectionId, db, schema, t.name)
                        return (
                          <TreeNode key={t.name} label={t.name} depth={3}
                            secondary={detail?.rowCount != null ? fmtCount(detail.rowCount) : undefined}
                            expanded={isExpanded(tKey)} loading={loading.has(tKey)}
                            onToggle={() => fetchColumns(db, schema, t.name)}
                            onClick={() => insertSelect(db, schema, t.name)}
                            icon={t.type === 'VIEW'
                              ? <Eye size={12} className="text-[#6a5a8a]" />
                              : <Table2 size={12} className="text-[#5a7a6a]" />
                            }
                          >
                            {detail?.columns.map((col) => (
                              <TreeNode key={col.name} label={col.name} depth={4}
                                secondary={col.dataType} muted
                                icon={<Columns3 size={11} className="text-[#2a2a2a]" />}
                              />
                            ))}
                          </TreeNode>
                        )
                      })}
                    </TreeNode>
                  )
                })}

                {schemas?.some((s) => SYSTEM_SCHEMAS.has(s)) && !search && (
                  <button
                    onClick={() => setShowSystem(v => !v)}
                    className="text-xs text-[#444] hover:text-[#777] py-1 transition-colors w-full text-left"
                    style={{ paddingLeft: 10 + 2 * 16 + 20 }}
                  >
                    {showSystem ? '− hide' : '+'} system schemas
                  </button>
                )}
              </TreeNode>
            )
          })}
        </TreeNode>
      </div>
    </div>
  )
}

function fmtCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`
  return String(n)
}

function ErrRow({ msg, depth }: { msg: string; depth: number }) {
  return (
    <div className="text-xs text-red-400 py-1 truncate font-mono" style={{ paddingLeft: 10 + depth * 16 }} title={msg}>
      ⚠ {msg}
    </div>
  )
}
