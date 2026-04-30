'use client'
import { useParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { QueryTabs } from '@/components/editor/QueryTabs'
import { SqlEditor } from '@/components/editor/SqlEditor'
import { EditorToolbar } from '@/components/editor/EditorToolbar'
import { ResultsPanel } from '@/components/results/ResultsPanel'
import { useEditorStore } from '@/lib/store/editor'
import { useSchemaStore } from '@/lib/store/schema'
import type { QueryResult, QueryError } from '@/types/query'

export default function WorkspacePage() {
  const params = useParams()
  const connectionId = params.connectionId as string

  const {
    tabs,
    activeTabId,
    setActiveTab,
    addTab,
    updateTabSql,
    updateTabDatabase,
    setTabRunning,
    setTabResult,
    setTabError,
    addHistory,
  } = useEditorStore()

  const schemaStore = useSchemaStore()
  const [splitPct, setSplitPct] = useState(55)
  const dragging = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Set initial active tab
  useEffect(() => {
    if (!activeTabId && tabs.length > 0) {
      setActiveTab(tabs[0].id)
    }
  }, [activeTabId, tabs, setActiveTab])

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0]

  const rawDbs = schemaStore.getDatabases(connectionId)
  const databases = Array.isArray(rawDbs) ? rawDbs : []

  useEffect(() => {
    if (!Array.isArray(schemaStore.getDatabases(connectionId))) {
      fetch(`/api/schema/${connectionId}`)
        .then(async (r) => { if (r.ok) schemaStore.setDatabases(connectionId, await r.json()) })
        .catch(() => {})
    }
  }, [connectionId, schemaStore])

  async function runQuery(sql: string) {
    if (!activeTab) return
    const db = activeTab.database
    setTabRunning(activeTab.id, true)
    const start = Date.now()
    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId, database: db, sql }),
      })
      const data = await res.json()
      const duration = Date.now() - start
      if (!res.ok) {
        const err: QueryError = data
        setTabError(activeTab.id, err)
        addHistory({ id: uuidv4(), sql, connectionId, database: db, timestamp: Date.now(), rowCount: null, duration, error: err.error })
      } else {
        const result: QueryResult = data
        setTabResult(activeTab.id, result)
        addHistory({ id: uuidv4(), sql, connectionId, database: db, timestamp: Date.now(), rowCount: result.rowCount, duration: result.duration, error: null })
      }
    } catch (e) {
      const err: QueryError = { error: (e as Error).message }
      setTabError(activeTab.id, err)
    }
  }

  function onMouseDown(e: React.MouseEvent) {
    dragging.current = true
    const container = containerRef.current
    if (!container) return
    const onMove = (ev: MouseEvent) => {
      if (!dragging.current || !container) return
      const rect = container.getBoundingClientRect()
      const pct = ((ev.clientY - rect.top) / rect.height) * 100
      setSplitPct(Math.max(20, Math.min(80, pct)))
    }
    const onUp = () => { dragging.current = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div ref={containerRef} className="flex flex-col h-full overflow-hidden">
      <QueryTabs />
      <EditorToolbar
        databases={databases}
        activeDatabase={activeTab?.database ?? ''}
        onDatabaseChange={(db) => activeTab && updateTabDatabase(activeTab.id, db)}
        onRun={() => activeTab && runQuery(activeTab.sql)}
        running={activeTab?.running ?? false}
      />

      <div className="flex-1 overflow-hidden" style={{ height: `${splitPct}%` }}>
        {activeTab && (
          <SqlEditor
            value={activeTab.sql}
            onChange={(sql) => updateTabSql(activeTab.id, sql)}
            onRun={runQuery}
            disabled={activeTab.running}
          />
        )}
      </div>

      <div
        className="h-1 cursor-row-resize bg-zinc-800 hover:bg-emerald-500/50 transition-colors shrink-0"
        onMouseDown={onMouseDown}
      />

      <div className="overflow-hidden" style={{ height: `${100 - splitPct}%` }}>
        {activeTab && (
          <ResultsPanel
            result={activeTab.result}
            error={activeTab.error}
            running={activeTab.running}
          />
        )}
      </div>
    </div>
  )
}
