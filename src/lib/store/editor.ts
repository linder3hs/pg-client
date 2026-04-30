'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import type { EditorTab, HistoryEntry, QueryResult, QueryError } from '@/types/query'

function newTab(database: string = ''): EditorTab {
  return {
    id: uuidv4(),
    label: 'Query',
    sql: '',
    result: null,
    error: null,
    running: false,
    database,
  }
}

interface EditorStore {
  tabs: EditorTab[]
  activeTabId: string | null
  history: HistoryEntry[]
  addTab: (database?: string) => void
  closeTab: (id: string) => void
  setActiveTab: (id: string) => void
  updateTabSql: (id: string, sql: string) => void
  updateTabDatabase: (id: string, database: string) => void
  setTabRunning: (id: string, running: boolean) => void
  setTabResult: (id: string, result: QueryResult) => void
  setTabError: (id: string, error: QueryError) => void
  addHistory: (entry: HistoryEntry) => void
}

export const useEditorStore = create<EditorStore>()(
  persist(
    (set) => ({
      tabs: [newTab()],
      activeTabId: null,
      history: [],

      addTab: (database = '') =>
        set((s) => {
          const tab = newTab(database)
          return { tabs: [...s.tabs, tab], activeTabId: tab.id }
        }),

      closeTab: (id) =>
        set((s) => {
          const next = s.tabs.filter((t) => t.id !== id)
          if (next.length === 0) {
            const tab = newTab()
            return { tabs: [tab], activeTabId: tab.id }
          }
          const activeTabId =
            s.activeTabId === id ? next[Math.max(0, next.indexOf(s.tabs.find((t) => t.id === id)!) - 1)]?.id ?? next[0].id : s.activeTabId
          return { tabs: next, activeTabId }
        }),

      setActiveTab: (id) => set({ activeTabId: id }),

      updateTabSql: (id, sql) =>
        set((s) => ({ tabs: s.tabs.map((t) => (t.id === id ? { ...t, sql } : t)) })),

      updateTabDatabase: (id, database) =>
        set((s) => ({ tabs: s.tabs.map((t) => (t.id === id ? { ...t, database } : t)) })),

      setTabRunning: (id, running) =>
        set((s) => ({ tabs: s.tabs.map((t) => (t.id === id ? { ...t, running } : t)) })),

      setTabResult: (id, result) =>
        set((s) => ({
          tabs: s.tabs.map((t) => (t.id === id ? { ...t, result, error: null, running: false } : t)),
        })),

      setTabError: (id, error) =>
        set((s) => ({
          tabs: s.tabs.map((t) => (t.id === id ? { ...t, error, result: null, running: false } : t)),
        })),

      addHistory: (entry) =>
        set((s) => ({ history: [entry, ...s.history].slice(0, 500) })),
    }),
    {
      name: 'pg-client-editor',
      partialize: (s) => ({ history: s.history }),
    }
  )
)
