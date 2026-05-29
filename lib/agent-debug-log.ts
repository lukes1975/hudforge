const DEBUG_SESSION_ID = '1a730f'
const DEBUG_INGEST_URL = 'http://127.0.0.1:7710/ingest/fb111c52-3d44-48a0-9eb3-c3ee65ff13e1'

export type AgentDebugPayload = {
  location: string
  message: string
  data?: Record<string, unknown>
  hypothesisId?: string
  runId?: string
}

export function agentDebugLog(payload: AgentDebugPayload) {
  const entry = {
    sessionId: DEBUG_SESSION_ID,
    timestamp: Date.now(),
    hypothesisId: payload.hypothesisId,
    runId: payload.runId,
    location: payload.location,
    message: payload.message,
    data: payload.data ?? {},
  }

  if (typeof window === 'undefined') {
    try {
      const fs = require('node:fs') as typeof import('node:fs')
      const path = require('node:path') as typeof import('node:path')
      const filePath = path.join(process.cwd(), '.cursor', `debug-${DEBUG_SESSION_ID}.log`)
      fs.mkdirSync(path.dirname(filePath), { recursive: true })
      fs.appendFileSync(filePath, `${JSON.stringify(entry)}\n`)
    } catch {
      // Best-effort file logging on server.
    }
  }

  const body = JSON.stringify(entry)
  if (typeof window !== 'undefined') {
    fetch('/api/debug-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {})
  }

  fetch(DEBUG_INGEST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': DEBUG_SESSION_ID },
    body,
    keepalive: true,
  }).catch(() => {})
}
