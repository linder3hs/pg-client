'use client'
import { useState, useRef } from 'react'
import { Table2, History, Download, Loader2, AlertCircle } from 'lucide-react'
import { ResultsGrid } from './ResultsGrid'
import { QueryHistory } from './QueryHistory'
import { cellToString, formatDuration, formatRowCount } from '@/lib/utils/format'
import type { QueryResult, QueryError } from '@/types/query'

type Tab = 'results' | 'history'

const TAB_META: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: 'results', label: 'Results', Icon: Table2 },
  { id: 'history', label: 'History', Icon: History },
]

export function ResultsPanel({ result, error, running }: { result: QueryResult | null; error: QueryError | null; running: boolean }) {
  const [activeTab, setActiveTab] = useState<Tab>('results')
  const lastResult = useRef<QueryResult | null>(null)
  if (result) lastResult.current = result

  function exportCsv() {
    const r = lastResult.current; if (!r) return
    const header = r.fields.map((f) => JSON.stringify(f.name)).join(',')
    const rows = r.rows.map((row) =>
      r.fields.map((f) => {
        const v = row[f.name]; if (v === null || v === undefined) return ''
        const s = cellToString(v)
        return s.includes(',') || s.includes('"') || s.includes('\n') ? JSON.stringify(s) : s
      }).join(',')
    )
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'results.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full bg-[#111]">
      <div className="flex items-center border-b border-[#222] shrink-0 px-3">
        {TAB_META.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === id ? 'text-white border-green-500' : 'text-[#555] border-transparent hover:text-[#888]'
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
        {running && (
          <span className="ml-3 flex items-center gap-1.5 text-sm text-green-400">
            <Loader2 size={12} className="animate-spin" />
            Running…
          </span>
        )}
        {result && activeTab === 'results' && (
          <div className="flex items-center gap-4 ml-auto">
            <span className="text-sm text-[#555] font-mono">{formatRowCount(result.rowCount)} · {formatDuration(result.duration)}</span>
            <button onClick={exportCsv} className="flex items-center gap-1.5 text-sm text-[#555] hover:text-[#aaa] transition-colors">
              <Download size={13} />
              CSV
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'results' && (
          <>
            {error && <ErrorView error={error} />}
            {!error && result && <ResultsGrid result={result} />}
            {!error && !result && !running && (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-[#3a3a3a]">Run a query to see results</p>
              </div>
            )}
          </>
        )}
        {activeTab === 'history' && <QueryHistory />}
      </div>
    </div>
  )
}

function ErrorView({ error }: { error: QueryError }) {
  return (
    <div className="p-5">
      <div className="bg-red-950/30 border border-red-800/30 rounded-xl p-4 flex gap-3">
        <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-red-300 font-mono leading-relaxed">{error.error}</p>
          {error.detail && <p className="text-xs text-red-400/60 mt-2">{error.detail}</p>}
          {error.hint && <p className="text-xs text-[#666] mt-1">Hint: {error.hint}</p>}
        </div>
      </div>
    </div>
  )
}
