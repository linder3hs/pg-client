'use client'
import { Play, Loader2, Database } from 'lucide-react'

interface Props {
  databases: string[]
  activeDatabase: string
  onDatabaseChange: (db: string) => void
  onRun: () => void
  running: boolean
}

export function EditorToolbar({ databases, activeDatabase, onDatabaseChange, onRun, running }: Props) {
  const safeDbs = Array.isArray(databases) ? databases : []
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[#222] bg-[#111] shrink-0">
      <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 focus-within:border-[#444] transition-colors">
        <Database size={13} className="text-[#444] shrink-0" />
        <select
          value={activeDatabase}
          onChange={(e) => onDatabaseChange(e.target.value)}
          className="bg-transparent text-sm text-[#aaa] focus:outline-none cursor-pointer"
        >
          <option value="">Select database…</option>
          {safeDbs.map((db) => <option key={db} value={db}>{db}</option>)}
        </select>
      </div>
      <div className="flex-1" />
      <span className="text-xs text-[#333] hidden sm:block font-mono">Ctrl+Enter</span>
      <button
        onClick={onRun}
        disabled={running}
        className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
      >
        {running
          ? <Loader2 size={13} className="animate-spin" />
          : <Play size={13} strokeWidth={2.5} />
        }
        {running ? 'Running…' : 'Run'}
      </button>
    </div>
  )
}
