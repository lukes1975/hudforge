export interface ResilientFetchConfig {
  timeoutMs?: number
  maxRetries?: number
  fetchImpl?: typeof fetch
  backoffMs?: number[]
}

export class ResilientFetchError extends Error {
  readonly timedOut: boolean
  readonly response?: Response

  constructor(message: string, options: { timedOut?: boolean; response?: Response; cause?: unknown } = {}) {
    super(message, { cause: options.cause })
    this.name = 'ResilientFetchError'
    this.timedOut = options.timedOut ?? false
    this.response = options.response
  }
}

const DEFAULT_TIMEOUT_MS = 30_000
const DEFAULT_MAX_RETRIES = 2
const DEFAULT_BACKOFF_MS = [1_000, 3_000]
const TRANSIENT_STATUS_CODES = new Set([429, 500, 502, 503, 504])

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isTransientStatus(status: number) {
  return TRANSIENT_STATUS_CODES.has(status)
}

function getBackoffMs(retryIndex: number, config: ResilientFetchConfig) {
  const base = config.backoffMs?.[retryIndex] ?? DEFAULT_BACKOFF_MS[retryIndex] ?? DEFAULT_BACKOFF_MS[DEFAULT_BACKOFF_MS.length - 1] ?? 3_000
  const jitter = Math.floor(Math.random() * 250)
  return base + jitter
}

function parseRetryAfterMs(response: Response) {
  const header = response.headers.get('Retry-After')
  if (!header) return null

  const seconds = Number(header)
  if (!Number.isNaN(seconds)) return Math.max(0, seconds * 1_000)

  const dateMs = Date.parse(header)
  if (!Number.isNaN(dateMs)) return Math.max(0, dateMs - Date.now())

  return null
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number, fetchImpl: typeof fetch) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetchImpl(url, { ...options, signal: controller.signal })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ResilientFetchError(`Request timed out after ${timeoutMs}ms`, { timedOut: true, cause: error })
    }
    throw error
  } finally {
    clearTimeout(timeout)
  }
}

export async function resilientFetch(url: string, options: RequestInit = {}, config: ResilientFetchConfig = {}): Promise<Response> {
  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const maxRetries = config.maxRetries ?? DEFAULT_MAX_RETRIES
  const fetchImpl = config.fetchImpl ?? fetch
  let lastResponse: Response | undefined
  let lastError: unknown

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const response = await fetchWithTimeout(url, options, timeoutMs, fetchImpl)
      lastResponse = response

      if (!isTransientStatus(response.status) || attempt === maxRetries) {
        if (isTransientStatus(response.status) && attempt === maxRetries) {
          throw new ResilientFetchError(`Request failed with status ${response.status} after ${attempt + 1} attempts`, { response })
        }
        return response
      }

      const retryAfterMs = parseRetryAfterMs(response) ?? getBackoffMs(attempt, config)
      await sleep(retryAfterMs)
    } catch (error) {
      lastError = error
      if (error instanceof ResilientFetchError && error.timedOut) {
        if (attempt === maxRetries) throw error
        await sleep(getBackoffMs(attempt, config))
        continue
      }

      const isLastAttempt = attempt === maxRetries
      if (isLastAttempt) {
        if (error instanceof ResilientFetchError) throw error
        throw new ResilientFetchError(error instanceof Error ? error.message : 'Request failed', { cause: error })
      }

      await sleep(getBackoffMs(attempt, config))
    }
  }

  if (lastResponse) return lastResponse
  throw new ResilientFetchError(lastError instanceof Error ? lastError.message : 'Request failed', { cause: lastError })
}
