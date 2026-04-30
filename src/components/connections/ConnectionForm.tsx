'use client'
import { useState, useEffect, useCallback } from 'react'
import { PlugZap, Save, Loader2, CheckCircle, XCircle } from 'lucide-react'
import type { ConnectionConfig, ConnectionSafe } from '@/types/connection'

interface Props {
  open: boolean
  onClose: () => void
  onSaved: (conn: ConnectionSafe) => void
  initial?: ConnectionSafe | null
}

const defaults: ConnectionConfig = {
  name: '', host: 'localhost', port: 5432, database: 'postgres', user: 'postgres', password: '',
}

export function ConnectionForm({ open, onClose, onSaved, initial }: Props) {
  const [form, setForm] = useState<ConnectionConfig>(initial ? { ...initial, password: '' } : defaults)
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null)

  useEffect(() => {
    setForm(initial ? { ...initial, password: '' } : defaults)
    setTestResult(null)
  }, [initial, open])

  const handleClose = useCallback(() => onClose(), [onClose])
  useEffect(() => {
    if (!open) return
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [open, handleClose])

  function set<K extends keyof ConnectionConfig>(key: K, val: ConnectionConfig[K]) {
    setTestResult(null)
    setForm((f) => ({ ...f, [key]: val }))
  }

  async function handleTest() {
    setTesting(true); setTestResult(null)
    try {
      const res = await fetch('/api/connections/test', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      })
      const data = await res.json()
      setTestResult(data.ok ? { ok: true, msg: 'Connection successful' } : { ok: false, msg: data.error })
    } catch { setTestResult({ ok: false, msg: 'Network error' }) }
    finally { setTesting(false) }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(initial ? `/api/connections/${initial.id}` : '/api/connections', {
        method: initial ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to save')
      onSaved(await res.json()); onClose()
    } catch { setTestResult({ ok: false, msg: 'Failed to save' }) }
    finally { setSaving(false) }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onClose} style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl w-full max-w-[460px] shadow-2xl"
        onClick={(e) => e.stopPropagation()}>

        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222]">
          <h2 className="text-base font-semibold text-white">{initial ? 'Edit connection' : 'New connection'}</h2>
          <button onClick={onClose} className="text-[#444] hover:text-[#999] text-xl leading-none transition-colors">×</button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          <Field label="Name">
            <input className="pg-input" placeholder="My local DB" value={form.name} onChange={(e) => set('name', e.target.value)} />
          </Field>
          <div className="grid grid-cols-[1fr_110px] gap-3">
            <Field label="Host">
              <input className="pg-input" value={form.host} onChange={(e) => set('host', e.target.value)} />
            </Field>
            <Field label="Port">
              <input className="pg-input" type="number" value={form.port} onChange={(e) => set('port', Number(e.target.value))} />
            </Field>
          </div>
          <Field label="Database">
            <input className="pg-input" value={form.database} onChange={(e) => set('database', e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Username">
              <input className="pg-input" value={form.user} onChange={(e) => set('user', e.target.value)} />
            </Field>
            <Field label="Password">
              <input className="pg-input" type="password" value={form.password} onChange={(e) => set('password', e.target.value)} />
            </Field>
          </div>

          {testResult && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-mono ${testResult.ok ? 'bg-green-950/30 text-green-400 border border-green-900/30' : 'bg-red-950/30 text-red-400 border border-red-900/30'}`}>
              {testResult.ok
                ? <CheckCircle size={14} className="shrink-0" />
                : <XCircle size={14} className="shrink-0" />
              }
              {testResult.msg}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-[#222]">
          <button onClick={handleTest} disabled={testing}
            className="flex items-center gap-2 px-4 py-2 text-sm text-[#777] hover:text-[#ccc] border border-[#2a2a2a] hover:border-[#444] rounded-lg transition-colors disabled:opacity-40">
            {testing
              ? <Loader2 size={13} className="animate-spin" />
              : <PlugZap size={13} />
            }
            {testing ? 'Testing…' : 'Test connection'}
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm text-[#666] hover:text-[#aaa] transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.name.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-colors">
              {saving
                ? <Loader2 size={13} className="animate-spin" />
                : <Save size={13} />
              }
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .pg-input {
          width: 100%; background: #111; border: 1px solid #2a2a2a; border-radius: 8px;
          padding: 9px 12px; font-size: 14px; color: #e0e0e0; font-family: inherit;
          outline: none; transition: border-color 0.15s;
        }
        .pg-input:focus { border-color: #16a34a; }
        .pg-input::placeholder { color: #444; }
      `}</style>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-[#666] uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}
