export interface Column {
  name: string
  dataType: string
  isNullable: boolean
  columnDefault: string | null
}

export interface TableInfo {
  name: string
  type: 'BASE TABLE' | 'VIEW' | string
}

export interface TableDetail {
  columns: Column[]
  rowCount: number | null
}

export type SchemaNode =
  | { kind: 'database'; name: string }
  | { kind: 'schema'; name: string }
  | { kind: 'table'; name: string; tableType: string }
  | { kind: 'column'; name: string; dataType: string; isNullable: boolean }
