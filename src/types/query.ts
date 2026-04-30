export interface QueryField {
  name: string
  dataTypeID: number
}

export interface QueryResult {
  rows: Record<string, unknown>[]
  fields: QueryField[]
  rowCount: number
  duration: number
}

export interface QueryError {
  error: string
  detail?: string
  hint?: string
  position?: string
}

export interface HistoryEntry {
  id: string
  sql: string
  connectionId: string
  database: string
  timestamp: number
  rowCount: number | null
  duration: number | null
  error: string | null
}

export interface EditorTab {
  id: string
  label: string
  sql: string
  result: QueryResult | null
  error: QueryError | null
  running: boolean
  database: string
}
