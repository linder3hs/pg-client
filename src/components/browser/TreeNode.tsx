'use client'
import { ReactNode } from 'react'

interface Props {
  label: string
  icon?: ReactNode
  depth: number
  expanded?: boolean
  loading?: boolean
  onToggle?: () => void
  onClick?: () => void
  children?: ReactNode
  secondary?: string
  muted?: boolean
}

export function TreeNode({ label, icon, depth, expanded, loading, onToggle, onClick, children, secondary, muted }: Props) {
  return (
    <div>
      <div
        className={`flex items-center gap-2 py-1.5 cursor-pointer select-none group hover:bg-white/[0.04] transition-colors`}
        style={{ paddingLeft: `${10 + depth * 16}px`, paddingRight: 10 }}
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
          <span className={`text-[11px] shrink-0 font-mono transition-colors ${muted ? 'text-[#555] group-hover:text-[#777]' : 'text-[#666] group-hover:text-[#888]'}`}>
            {secondary}
          </span>
        )}
      </div>
      {expanded && children}
    </div>
  )
}
