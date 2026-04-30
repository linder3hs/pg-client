export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

export function formatRowCount(n: number): string {
  return n === 1 ? '1 row' : `${n.toLocaleString()} rows`
}

export function formatNullValue(): string {
  return 'NULL'
}

export function cellToString(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
