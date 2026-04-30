'use client'
import { ReactNode } from 'react'
import { Plus } from 'lucide-react'

interface Props {
  label: string
  icon?: ReactNode
  depth: number
  expanded?: boolean
  loading?: boolean
  onToggle?: () => void
  onClick?: () => void
  onAdd?: () => void
  addTitle?: string
  children?: ReactNode
  secondary?: string
  muted?: boolean
}

export function TreeNode({ label, icon, depth, expanded, loading, onToggle, onClick, onAdd, addTitle, children, secondary, muted }: Props) {
  return (
    <div>
      <div
        className={`flex items-center gap-2 py-1.5 select-none group hover:bg-white/[0.04] transition-colors`}
        style={{ paddingLeft: `${10 + depth * 16}px`, paddingRight: 6 }}
      >
        <span
          className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
          onClick={() => { onToggle?.(); onClick?.() }}
        >
          {onToggle !== undefined ? (
            <span className="text-[#555] text-[10px] w-3 shrink-0 group-hover:text-[#888]">
              {loading ? '…' : expanded ? '▾' : '▸'}
            </span>
          ) : (
            <span className="w-3 shrink-0" />
          )}
          {icon && <span className="shrink-0">{icon}</span>}
          <span className={`text-[13px] truncate flex-1 transition-colors ${muted ? 'text-[#777] group-hover:text-[#aaa]' : 'text-[#c8c8c8] group-hover:text-white'}`}>
            {label}
          </span>
          {secondary && (
            <span className={`text-[11px] shrink-0 font-mono transition-colors mr-1 ${muted ? 'text-[#555] group-hover:text-[#777]' : 'text-[#666] group-hover:text-[#888]'}`}>
              {secondary}
            </span>
          )}
        </span>
        {onAdd && (
          <button
            onClick={(e) => { e.stopPropagation(); onAdd() }}
            title={addTitle ?? 'Create new'}
            className="opacity-0 group-hover:opacity-100 p-1 rounded text-[#444] hover:text-green-400 hover:bg-green-950/30 transition-all shrink-0"
          >
            <Plus size={12} />
          </button>
        )}
      </div>
      {expanded && children}
    </div>
  )
}
