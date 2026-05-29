import { appendFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'

const DEBUG_SESSION_ID = '1a730f'
const DEBUG_INGEST_URL = 'http://127.0.0.1:7710/ingest/fb111c52-3d44-48a0-9eb3-c3ee65ff13e1'

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return new Response(null, { status: 404 })
  }

  try {
    const entry = await request.json()
    const filePath = join(process.cwd(), '.cursor', `debug-${DEBUG_SESSION_ID}.log`)
    mkdirSync(dirname(filePath), { recursive: true })
    appendFileSync(filePath, `${JSON.stringify(entry)}\n`)

    fetch(DEBUG_INGEST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': DEBUG_SESSION_ID },
      body: JSON.stringify(entry),
    }).catch(() => {})

    return Response.json({ ok: true })
  } catch {
    return Response.json({ ok: false }, { status: 400 })
  }
}
