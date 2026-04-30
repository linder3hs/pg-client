'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Plug, PlugZap, Edit2, Trash2, CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react'
import { ConnectionForm } from './ConnectionForm'
import { useConnectionsStore } from '@/lib/store/connections'
import type { ConnectionSafe } from '@/types/connection'

type TestState = 'idle' | 'testing' | 'ok' | 'fail'

export function ConnectionList() {
  const { connections, setConnections, addConnection, removeConnection, updateConnection } = useConnectionsStore()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ConnectionSafe | null>(null)
  const [testStates, setTestStates] = useState<Record<string, { state: TestState; msg?: string }>>({})
  const router = useRouter()

  useEffect(() => {
    fetch('/api/connections').then((r) => r.json()).then(setConnections)
  }, [setConnections])

  async function handleDelete(id: string) {
    await fetch(`/api/connections/${id}`, { method: 'DELETE' })
    removeConnection(id)
  }

  async function handleTest(conn: ConnectionSafe) {
    setTestStates((s) => ({ ...s, [conn.id]: { state: 'testing' } }))
    try {
      const res = await fetch('/api/connections/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host: conn.host, port: conn.port, database: conn.database, user: conn.user, password: '' }),
      })
      const data = await res.json()
      setTestStates((s) => ({ ...s, [conn.id]: data.ok ? { state: 'ok' } : { state: 'fail', msg: data.error } }))
    } catch {
      setTestStates((s) => ({ ...s, [conn.id]: { state: 'fail', msg: 'Network error' } }))
    }
  }

  function handleSaved(conn: ConnectionSafe) {
    if (editing) updateConnection(conn); else addConnection(conn)
    setEditing(null)
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Connections</h1>
          <p className="text-sm text-[#555] mt-1">Manage your local PostgreSQL databases</p>
        </div>
        <button
          onClick={() => { setEditing(null); setFormOpen(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-green-900/20"
        >
          <Plus size={15} strokeWidth={2.5} />
          New connection
        </button>
      </div>

      {/* List */}
      {connections.length === 0 ? (
        <div className="border border-dashed border-[#252525] rounded-2xl p-16 text-center flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#1a1a1a] flex items-center justify-center">
            <Plug size={22} className="text-[#444]" />
          </div>
          <div>
            <p className="text-base text-[#666]">No connections yet</p>
            <p className="text-sm text-[#3a3a3a] mt-0.5">Add your first PostgreSQL connection to get started</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {connections.map((conn) => {
            const ts = testStates[conn.id]
            return (
              <div key={conn.id}
                className="group border border-[#222] hover:border-[#333] rounded-2xl overflow-hidden transition-all bg-[#161616]"
              >
                <div className="flex items-center gap-4 px-5 py-4">
                  {/* Status dot + icon */}
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-[#1e1e1e] flex items-center justify-center">
                      <PlugZap size={18} className="text-[#444]" />
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#161616] ${
                      ts?.state === 'ok' ? 'bg-green-400' : ts?.state === 'fail' ? 'bg-red-400' : 'bg-[#333]'
                    }`} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-[#e8e8e8] truncate">{conn.name}</p>
                    <p className="text-sm text-[#555] truncate font-mono mt-0.5">
                      {conn.user}@{conn.host}:{conn.port}
                      <span className="text-[#333] mx-1">/</span>
                      {conn.database}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <IconBtn onClick={() => handleTest(conn)} disabled={ts?.state === 'testing'} title="Test connection">
                      {ts?.state === 'testing' ? <Loader2 size={14} className="animate-spin" /> : <PlugZap size={14} />}
                    </IconBtn>
                    <IconBtn onClick={() => { setEditing(conn); setFormOpen(true) }} title="Edit">
                      <Edit2 size={14} />
                    </IconBtn>
                    <IconBtn onClick={() => handleDelete(conn.id)} title="Delete" danger>
                      <Trash2 size={14} />
                    </IconBtn>
                  </div>

                  <button
                    onClick={() => router.push(`/workspace/${conn.id}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1e1e1e] hover:bg-[#2a2a2a] border border-[#2a2a2a] hover:border-[#3a3a3a] text-sm text-white rounded-xl transition-colors font-medium shrink-0"
                  >
                    Connect
                    <ArrowRight size={14} />
                  </button>
                </div>

                {ts?.state === 'ok' && (
                  <div className="flex items-center gap-2 px-5 py-2.5 bg-green-950/25 border-t border-green-900/25">
                    <CheckCircle size={13} className="text-green-400 shrink-0" />
                    <span className="text-sm text-green-400">Connection successful</span>
                  </div>
                )}
                {ts?.state === 'fail' && (
                  <div className="flex items-center gap-2 px-5 py-2.5 bg-red-950/25 border-t border-red-900/25">
                    <XCircle size={13} className="text-red-400 shrink-0" />
                    <span className="text-sm text-red-400 font-mono truncate">{ts.msg}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <ConnectionForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null) }}
        onSaved={handleSaved}
        initial={editing}
      />
    </div>
  )
}

function IconBtn({ children, onClick, disabled, danger, title }: {
  children: React.ReactNode; onClick: () => void; disabled?: boolean; danger?: boolean; title?: string
}) {
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      className={`p-2 rounded-lg transition-colors disabled:opacity-40 ${
        danger ? 'text-[#555] hover:text-red-400 hover:bg-red-950/30' : 'text-[#555] hover:text-[#ccc] hover:bg-[#222]'
      }`}
    >{children}</button>
  )
}
