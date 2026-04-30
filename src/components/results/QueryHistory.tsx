'use client'
import { CheckCircle2, XCircle, CornerUpLeft } from 'lucide-react'
import { useEditorStore } from '@/lib/store/editor'
import { formatDuration } from '@/lib/utils/format'

export function QueryHistory() {
  const { history, activeTabId, updateTabSql } = useEditorStore()

  if (history.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-[#3a3a3a]">No query history yet</p>
      </div>
    )
  }

  return (
    <div className="overflow-auto h-full">
      {history.map((entry) => (
        <div key={entry.id} onClick={() => activeTabId && updateTabSql(activeTabId, entry.sql)}
          className="flex items-start gap-3 px-4 py-3 border-b border-[#1a1a1a] hover:bg-white/[0.03] cursor-pointer group transition-colors"
        >
          {entry.error
            ? <XCircle size={14} className="text-red-500/50 shrink-0 mt-0.5" />
            : <CheckCircle2 size={14} className="text-green-500/40 shrink-0 mt-0.5" />
          }
          <div className="flex-1 min-w-0">
            <p className="text-sm font-mono text-[#777] group-hover:text-[#ccc] truncate transition-colors">{entry.sql.trim()}</p>
            <p className="text-xs text-[#3a3a3a] mt-0.5 font-mono">
              {new Date(entry.timestamp).toLocaleTimeString()}
              {entry.database && ` · ${entry.database}`}
              {entry.rowCount != null && ` · ${entry.rowCount} rows`}
              {entry.duration != null && ` · ${formatDuration(entry.duration)}`}
              {entry.error && <span className="text-red-500/50"> · error</span>}
            </p>
          </div>
          <span className="text-[#333] opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <CornerUpLeft size={13} />
          </span>
        </div>
      ))}
    </div>
  )
}
