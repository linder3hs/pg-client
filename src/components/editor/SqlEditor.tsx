'use client'
import { useEffect, useRef } from 'react'
import { EditorView, keymap } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { sql } from '@codemirror/lang-sql'
import { defaultKeymap, historyKeymap, history } from '@codemirror/commands'
import { oneDark } from '@codemirror/theme-one-dark'
import { extractStatementAtCursor } from '@/lib/utils/sql'

interface Props {
  value: string
  onChange: (val: string) => void
  onRun: (sql: string) => void
  disabled?: boolean
}

export function SqlEditor({ value, onChange, onRun, disabled }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const onRunRef = useRef(onRun)
  const onChangeRef = useRef(onChange)
  onRunRef.current = onRun
  onChangeRef.current = onChange

  useEffect(() => {
    if (!containerRef.current) return

    const runCmd = () => {
      const view = viewRef.current
      if (!view) return true
      const state = view.state
      const cursorPos = state.selection.main.head
      const fullSql = state.doc.toString()
      const stmt = extractStatementAtCursor(fullSql, cursorPos)
      onRunRef.current(stmt)
      return true
    }

    const state = EditorState.create({
      doc: value,
      extensions: [
        history(),
        sql(),
        oneDark,
        EditorView.theme({
          '&': { height: '100%', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace' },
          '.cm-scroller': { overflow: 'auto' },
          '.cm-content': { padding: '12px 0' },
          '&.cm-focused': { outline: 'none' },
          '.cm-line': { padding: '0 16px' },
        }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString())
          }
        }),
        keymap.of([
          { key: 'Ctrl-Enter', run: runCmd, mac: 'Cmd-Enter' },
          ...defaultKeymap,
          ...historyKeymap,
        ]),
      ],
    })

    const view = new EditorView({ state, parent: containerRef.current })
    viewRef.current = view

    return () => { view.destroy(); viewRef.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const current = view.state.doc.toString()
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      })
    }
  }, [value])

  return (
    <div
      ref={containerRef}
      className={`h-full w-full overflow-hidden ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
    />
  )
}
