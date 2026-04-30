'use client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { ArrowLeft, Server } from 'lucide-react'
import { SchemaTree } from '@/components/browser/SchemaTree'
import { useConnectionsStore } from '@/lib/store/connections'

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const connectionId = params.connectionId as string
  const router = useRouter()
  const { connections, setConnections, setActiveConnection } = useConnectionsStore()
  const [sidebarWidth, setSidebarWidth] = useState(260)
  const dragging = useRef(false)

  useEffect(() => {
    fetch('/api/connections')
      .then((r) => r.json())
      .then((conns) => { setConnections(conns); setActiveConnection(connectionId) })
  }, [connectionId, setConnections, setActiveConnection])

  const conn = connections.find((c) => c.id === connectionId)

  function onMouseDown() {
    dragging.current = true
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return
      setSidebarWidth(Math.max(200, Math.min(500, e.clientX)))
    }
    const onUp = () => {
      dragging.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div className="flex flex-col h-screen bg-[#111]" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <header className="flex items-center gap-3 px-4 border-b border-[#222] shrink-0" style={{ height: 48 }}>
        <button
          onClick={() => router.push('/connections')}
          className="text-sm font-bold text-green-400 hover:text-green-300 transition-colors font-mono tracking-tight"
        >
          pg
        </button>
        <span className="text-[#2a2a2a]">/</span>
        <div className="flex items-center gap-2">
          <Server size={13} className="text-[#444]" />
          <span className="text-sm text-[#bbb] font-medium">{conn?.name ?? '…'}</span>
        </div>
        <div className="flex-1" />
        <span className="text-xs text-[#3a3a3a] font-mono">{conn ? `${conn.host}:${conn.port}` : ''}</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className="flex flex-col bg-[#0f0f0f] border-r border-[#1e1e1e] overflow-hidden shrink-0"
          style={{ width: sidebarWidth }}
        >
          <div className="flex-1 overflow-auto">
            <SchemaTree connectionId={connectionId} />
          </div>
          <div className="px-3 py-3 border-t border-[#1e1e1e]">
            <button
              onClick={() => router.push('/connections')}
              className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm text-[#888] hover:text-white hover:bg-white/[0.06] transition-colors font-medium"
            >
              <ArrowLeft size={14} />
              All connections
            </button>
          </div>
        </aside>

        {/* Drag handle */}
        <div
          className="w-1 cursor-col-resize bg-[#1e1e1e] hover:bg-green-500/40 transition-colors shrink-0"
          onMouseDown={onMouseDown}
        />

        <main className="flex-1 overflow-hidden bg-[#111]">{children}</main>
      </div>
    </div>
  )
}
