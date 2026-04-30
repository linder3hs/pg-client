'use client'
import { useRef, useMemo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { cellToString } from '@/lib/utils/format'
import type { QueryResult } from '@/types/query'

const ROW_H = 32

export function ResultsGrid({ result }: { result: QueryResult }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const colWidths = useMemo(() => {
    return result.fields.map((f) => {
      const headerLen = f.name.length
      const maxVal = result.rows.slice(0, 100).reduce((m, r) => Math.max(m, cellToString(r[f.name]).length), 0)
      return Math.min(Math.max(headerLen, maxVal) * 8 + 32, 360)
    })
  }, [result.fields, result.rows])

  const rowVirtualizer = useVirtualizer({
    count: result.rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_H,
    overscan: 20,
  })

  return (
    <div ref={parentRef} className="h-full overflow-auto" style={{ contain: 'strict' }}>
      <div style={{ minWidth: colWidths.reduce((a, b) => a + b, 0) + 44 }}>
        {/* Header */}
        <div className="flex sticky top-0 bg-[#161616] border-b border-[#222] z-10" style={{ height: ROW_H }}>
          <div className="w-11 shrink-0 border-r border-[#222] flex items-center justify-end pr-3">
            <span className="text-xs text-[#333]">#</span>
          </div>
          {result.fields.map((f, i) => (
            <div key={f.name} className="flex items-center px-3 border-r border-[#222] shrink-0" style={{ width: colWidths[i] }}>
              <span className="text-xs font-semibold text-[#666] uppercase tracking-wide truncate">{f.name}</span>
            </div>
          ))}
        </div>

        {/* Rows */}
        <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
          {rowVirtualizer.getVirtualItems().map((vRow) => {
            const row = result.rows[vRow.index]
            return (
              <div key={vRow.key}
                className="flex absolute top-0 left-0 w-full border-b border-[#1a1a1a] hover:bg-white/[0.03] transition-colors"
                style={{ transform: `translateY(${vRow.start}px)`, height: ROW_H }}
              >
                <div className="w-11 shrink-0 border-r border-[#1a1a1a] flex items-center justify-end pr-3">
                  <span className="text-xs text-[#333]">{vRow.index + 1}</span>
                </div>
                {result.fields.map((f, i) => {
                  const val = row[f.name]
                  const isNull = val === null || val === undefined
                  return (
                    <div key={f.name} className="flex items-center px-3 border-r border-[#1a1a1a] shrink-0 overflow-hidden" style={{ width: colWidths[i] }}>
                      {isNull
                        ? <span className="text-sm text-[#333] italic font-mono">null</span>
                        : <span className="text-sm text-[#ccc] font-mono truncate">{cellToString(val)}</span>
                      }
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
