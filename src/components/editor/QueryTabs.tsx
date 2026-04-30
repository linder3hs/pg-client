'use client'
import { Plus, X, FileCode2, Loader2 } from 'lucide-react'
import { useEditorStore } from '@/lib/store/editor'

export function QueryTabs() {
  const { tabs, activeTabId, addTab, closeTab, setActiveTab } = useEditorStore()
  return (
    <div className="flex items-end border-b border-[#222] bg-[#0d0d0d] overflow-x-auto shrink-0 px-2 pt-1.5">
      {tabs.map((tab, i) => {
        const active = tab.id === activeTabId
        return (
          <div key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 cursor-pointer rounded-t-lg mr-0.5 shrink-0 text-sm group transition-colors ${
              active ? 'bg-[#111] text-white border border-b-0 border-[#222]' : 'text-[#555] hover:text-[#888]'
            }`}
          >
            {tab.running
              ? <Loader2 size={12} className="animate-spin text-green-400 shrink-0" />
              : <FileCode2 size={12} className={active ? 'text-[#666]' : 'text-[#3a3a3a]'} />
            }
            <span>Query {i + 1}</span>
            <button
              onClick={(e) => { e.stopPropagation(); closeTab(tab.id) }}
              className={`rounded p-0.5 transition-colors ${active ? 'text-[#555] hover:text-[#aaa] hover:bg-[#222]' : 'opacity-0 group-hover:opacity-100 text-[#444] hover:text-[#888]'}`}
            >
              <X size={11} />
            </button>
          </div>
        )
      })}
      <button onClick={() => addTab()}
        className="flex items-center gap-1 px-2.5 py-2 text-[#444] hover:text-[#777] transition-colors shrink-0 rounded-t-lg hover:bg-[#1a1a1a]">
        <Plus size={14} />
      </button>
    </div>
  )
}
