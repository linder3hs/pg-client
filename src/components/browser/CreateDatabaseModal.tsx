'use client'
import { useState } from 'react'
import { Database, Loader2, CheckCircle } from 'lucide-react'

interface Props {
  connectionId: string
  onClose: () => void
  onCreated: (name: string) => void
}

export function CreateDatabaseModal({ connectionId, onClose, onCreated }: Props) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate() {
    if (!name.trim()) return
    setSaving(true); setError(null)
    try {
      const res = await fetch(`/api/schema/${connectionId}/database`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onClose} style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}>

        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#222]">
          <Database size={16} className="text-green-400" />
          <h2 className="text-base font-semibold text-white">Create database</h2>
          <button onClick={onClose} className="ml-auto text-[#444] hover:text-[#999] text-xl leading-none">×</button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#666] uppercase tracking-wider">Database name</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => { setName(e.target.value); setError(null) }}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="my_database"
              className="w-full bg-[#111] border border-[#2a2a2a] focus:border-green-600 rounded-lg px-3 py-2.5 text-sm text-[#e0e0e0] placeholder-[#444] outline-none transition-colors font-mono"
            />
            <p className="text-xs text-[#444]">Letters, numbers and underscores only</p>
          </div>

          {error && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-red-950/30 border border-red-900/30 rounded-lg">
              <span className="text-red-400 text-xs font-mono">{error}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#222]">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#666] hover:text-[#aaa] transition-colors">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={saving || !name.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
            {saving ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}
