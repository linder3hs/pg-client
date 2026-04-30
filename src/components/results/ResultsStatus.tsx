import { formatDuration, formatRowCount } from '@/lib/utils/format'
import type { QueryResult, QueryError } from '@/types/query'

interface Props {
  result: QueryResult | null
  error: QueryError | null
  onExportCsv?: () => void
}

export function ResultsStatus({ result, error, onExportCsv }: Props) {
  if (error) {
    return (
      <div className="px-3 py-2 border-t border-zinc-800 bg-red-950/30">
        <p className="text-xs text-red-400 font-mono">{error.error}</p>
        {error.detail && <p className="text-[11px] text-red-500/70 mt-0.5">{error.detail}</p>}
        {error.hint && <p className="text-[11px] text-zinc-500 mt-0.5">Hint: {error.hint}</p>}
      </div>
    )
  }
  if (!result) return null
  return (
    <div className="flex items-center gap-3 px-3 py-1.5 border-t border-zinc-800 bg-zinc-950 shrink-0">
      <span className="text-[11px] text-zinc-400">
        {formatRowCount(result.rowCount)} · {formatDuration(result.duration)}
      </span>
      <div className="flex-1" />
      {onExportCsv && (
        <button onClick={onExportCsv} className="text-[11px] text-zinc-500 hover:text-zinc-300">
          ↓ CSV
        </button>
      )}
    </div>
  )
}
