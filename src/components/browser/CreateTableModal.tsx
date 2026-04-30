'use client'
import { useState, useId } from 'react'
import { Plus, Trash2, Loader2, Table2, Key, Sparkles } from 'lucide-react'

interface ColumnDef {
  id: string
  name: string
  type: string
  nullable: boolean
  primaryKey: boolean
  defaultValue: string
}

interface Props {
  connectionId: string
  database: string
  schema: string
  onClose: () => void
  onCreated: (name: string) => void
}

const PG_TYPES = [
  'text', 'varchar(255)', 'char(1)',
  'integer', 'bigint', 'smallint', 'serial', 'bigserial',
  'boolean',
  'uuid',
  'timestamp with time zone', 'timestamp without time zone', 'date', 'time',
  'numeric', 'float', 'double precision',
  'jsonb', 'json',
  'bytea',
]

function quoteIdent(s: string) { return '"' + s.replace(/"/g, '""') + '"' }

function buildSQL(schema: string, table: string, columns: ColumnDef[]): string {
  if (!table.trim() || columns.length === 0) return ''
  const pkCols = columns.filter((c) => c.primaryKey).map((c) => quoteIdent(c.name))
  const defs: string[] = columns
    .filter((c) => c.name.trim())
    .map((col) => {
      let def = `  ${quoteIdent(col.name)} ${col.type}`
      if (col.defaultValue.trim()) def += ` DEFAULT ${col.defaultValue.trim()}`
      if (!col.nullable || col.primaryKey) def += ' NOT NULL'
      return def
    })
  if (pkCols.length > 0) defs.push(`  PRIMARY KEY (${pkCols.join(', ')})`)
  return `CREATE TABLE ${quoteIdent(schema)}.${quoteIdent(table)} (\n${defs.join(',\n')}\n);`
}

function newCol(overrides?: Partial<ColumnDef>): ColumnDef {
  return { id: crypto.randomUUID(), name: '', type: 'text', nullable: true, primaryKey: false, defaultValue: '', ...overrides }
}

export function CreateTableModal({ connectionId, database, schema, onClose, onCreated }: Props) {
  const [tableName, setTableName] = useState('')
  const [columns, setColumns] = useState<ColumnDef[]>([newCol()])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSql, setShowSql] = useState(false)

  const sql = buildSQL(schema, tableName, columns)
  const uid = useId()

  function updateCol(id: string, patch: Partial<ColumnDef>) {
    setColumns((cols) => cols.map((c) => c.id === id ? { ...c, ...patch } : c))
    setError(null)
  }

  function removeCol(id: string) {
    setColumns((cols) => cols.length > 1 ? cols.filter((c) => c.id !== id) : cols)
  }

  function addAutoId() {
    setColumns((cols) => [
      newCol({ name: 'id', type: 'uuid', nullable: false, primaryKey: true, defaultValue: 'gen_random_uuid()' }),
      ...cols,
    ])
  }

  async function handleCreate() {
    if (!tableName.trim() || columns.filter(c => c.name.trim()).length === 0) return
    setSaving(true); setError(null)
    try {
      const res = await fetch(
        `/api/schema/${connectionId}/${encodeURIComponent(database)}/${encodeURIComponent(schema)}/table`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: tableName.trim(), columns: columns.filter(c => c.name.trim()) }),
        }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onCreated(data.name)
      onClose()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose} style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#222] shrink-0">
          <Table2 size={16} className="text-green-400" />
          <h2 className="text-base font-semibold text-white">Create table</h2>
          <span className="text-[#333] text-sm">in <span className="text-[#666] font-mono">{schema}</span></span>
          <button onClick={onClose} className="ml-auto text-[#444] hover:text-[#999] text-xl leading-none">×</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto px-6 py-5 flex flex-col gap-5">
          {/* Table name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#666] uppercase tracking-wider">Table name</label>
            <input
              autoFocus
              value={tableName}
              onChange={(e) => { setTableName(e.target.value); setError(null) }}
              placeholder="users"
              className="w-full bg-[#111] border border-[#2a2a2a] focus:border-green-600 rounded-lg px-3 py-2.5 text-sm text-[#e0e0e0] placeholder-[#444] outline-none transition-colors font-mono"
            />
          </div>

          {/* Columns */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[#666] uppercase tracking-wider">Columns</label>
              <button onClick={addAutoId}
                className="flex items-center gap-1.5 text-xs text-[#555] hover:text-green-400 transition-colors">
                <Sparkles size={11} />
                Add id column
              </button>
            </div>

            {/* Column header */}
            <div className="grid gap-2 text-xs text-[#444] uppercase tracking-wider px-1"
              style={{ gridTemplateColumns: '1fr 160px 60px 40px 40px 32px' }}>
              <span>Name</span>
              <span>Type</span>
              <span>Default</span>
              <span className="text-center">PK</span>
              <span className="text-center">Null</span>
              <span />
            </div>

            <div className="flex flex-col gap-1.5">
              {columns.map((col) => (
                <div key={col.id} className="grid gap-2 items-center"
                  style={{ gridTemplateColumns: '1fr 160px 60px 40px 40px 32px' }}>
                  <input
                    value={col.name}
                    onChange={(e) => updateCol(col.id, { name: e.target.value })}
                    placeholder="column_name"
                    className="bg-[#111] border border-[#222] focus:border-[#444] rounded-lg px-3 py-2 text-sm text-[#e0e0e0] placeholder-[#333] outline-none font-mono transition-colors"
                  />
                  <select
                    value={col.type}
                    onChange={(e) => updateCol(col.id, { type: e.target.value })}
                    className="bg-[#111] border border-[#222] focus:border-[#444] rounded-lg px-2 py-2 text-sm text-[#ccc] outline-none cursor-pointer transition-colors"
                  >
                    {PG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <input
                    value={col.defaultValue}
                    onChange={(e) => updateCol(col.id, { defaultValue: e.target.value })}
                    placeholder="null"
                    className="bg-[#111] border border-[#222] focus:border-[#444] rounded-lg px-2 py-2 text-sm text-[#ccc] placeholder-[#333] outline-none font-mono transition-colors"
                  />
                  <label className="flex items-center justify-center cursor-pointer">
                    <input type="checkbox" checked={col.primaryKey}
                      onChange={(e) => updateCol(col.id, { primaryKey: e.target.checked, nullable: e.target.checked ? false : col.nullable })}
                      className="w-4 h-4 accent-green-500 cursor-pointer"
                    />
                  </label>
                  <label className="flex items-center justify-center cursor-pointer">
                    <input type="checkbox" checked={col.nullable && !col.primaryKey}
                      disabled={col.primaryKey}
                      onChange={(e) => updateCol(col.id, { nullable: e.target.checked })}
                      className="w-4 h-4 accent-green-500 cursor-pointer disabled:opacity-30"
                    />
                  </label>
                  <button onClick={() => removeCol(col.id)} disabled={columns.length === 1}
                    className="flex items-center justify-center text-[#333] hover:text-red-400 disabled:opacity-20 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            <button onClick={() => setColumns((c) => [...c, newCol()])}
              className="flex items-center gap-2 px-3 py-2 text-sm text-[#555] hover:text-[#aaa] border border-dashed border-[#222] hover:border-[#333] rounded-lg transition-colors w-full justify-center mt-1">
              <Plus size={13} />
              Add column
            </button>
          </div>

          {/* SQL Preview */}
          <div className="flex flex-col gap-2">
            <button onClick={() => setShowSql(v => !v)}
              className="text-xs text-[#444] hover:text-[#777] transition-colors text-left">
              {showSql ? '▾' : '▸'} SQL preview
            </button>
            {showSql && sql && (
              <pre className="bg-[#0d0d0d] border border-[#1e1e1e] rounded-lg px-4 py-3 text-xs text-[#888] font-mono overflow-auto whitespace-pre">
                {sql}
              </pre>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-red-950/30 border border-red-900/30 rounded-lg">
              <span className="text-red-400 text-xs font-mono">{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#222] shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#666] hover:text-[#aaa] transition-colors">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={saving || !tableName.trim() || columns.filter(c => c.name.trim()).length === 0}
            className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Table2 size={13} />}
            {saving ? 'Creating…' : 'Create table'}
          </button>
        </div>
      </div>
    </div>
  )
}
