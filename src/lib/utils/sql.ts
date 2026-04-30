export function extractStatementAtCursor(sql: string, cursorPos: number): string {
  const statements = splitStatements(sql)
  let offset = 0
  for (const stmt of statements) {
    const start = sql.indexOf(stmt, offset)
    const end = start + stmt.length
    offset = end
    if (cursorPos <= end) {
      const trimmed = stmt.trim()
      if (trimmed) return trimmed
    }
  }
  const last = statements[statements.length - 1]?.trim()
  return last || sql.trim()
}

function splitStatements(sql: string): string[] {
  const results: string[] = []
  let current = ''
  let inString = false
  let stringChar = ''
  let inComment = false
  let inLineComment = false

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i]
    const next = sql[i + 1]

    if (inLineComment) {
      if (ch === '\n') inLineComment = false
      current += ch
      continue
    }
    if (inComment) {
      if (ch === '*' && next === '/') {
        inComment = false
        current += ch + next
        i++
      } else {
        current += ch
      }
      continue
    }
    if (inString) {
      if (ch === stringChar && next !== stringChar) {
        inString = false
        current += ch
      } else if (ch === stringChar && next === stringChar) {
        current += ch + next
        i++
      } else {
        current += ch
      }
      continue
    }

    if (ch === '-' && next === '-') {
      inLineComment = true
      current += ch
      continue
    }
    if (ch === '/' && next === '*') {
      inComment = true
      current += ch
      continue
    }
    if (ch === "'" || ch === '"') {
      inString = true
      stringChar = ch
      current += ch
      continue
    }

    if (ch === ';') {
      current += ch
      results.push(current)
      current = ''
      continue
    }

    current += ch
  }

  if (current.trim()) results.push(current)
  return results
}
