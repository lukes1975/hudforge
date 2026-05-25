import { afterEach, describe, expect, it, vi } from 'vitest'
import { resilientFetch, ResilientFetchError } from '../lib/fetch-utils'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('resilientFetch', () => {
  it('times out when the upstream request does not finish', async () => {
    const fetchImpl = vi.fn(((_url: string, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(Object.assign(new Error('Aborted'), { name: 'AbortError' }))
        })
      })) as typeof fetch)

    await expect(
      resilientFetch('https://example.com/test', {}, { timeoutMs: 50, maxRetries: 0, fetchImpl })
    ).rejects.toMatchObject({ timedOut: true })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('retries transient 429 and 503 responses', async () => {
    vi.useFakeTimers()
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(new Response('rate limited', { status: 429 }))
      .mockResolvedValueOnce(new Response('unavailable', { status: 503 }))
      .mockResolvedValueOnce(new Response('ok', { status: 200 }))

    const promise = resilientFetch('https://example.com/retry', {}, { timeoutMs: 5_000, maxRetries: 2, fetchImpl, backoffMs: [100, 100] })
    await vi.runAllTimersAsync()
    const response = await promise

    expect(response.status).toBe(200)
    expect(fetchImpl).toHaveBeenCalledTimes(3)
    vi.useRealTimers()
  })

  it('does not retry 400, 401, or 403 responses', async () => {
    for (const status of [400, 401, 403]) {
      const fetchImpl = vi.fn().mockResolvedValue(new Response('client error', { status }))
      const response = await resilientFetch('https://example.com/client-error', {}, { timeoutMs: 5_000, maxRetries: 2, fetchImpl })
      expect(response.status).toBe(status)
      expect(fetchImpl).toHaveBeenCalledTimes(1)
    }
  })

  it('respects Retry-After before retrying', async () => {
    vi.useFakeTimers()
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(new Response('rate limited', { status: 429, headers: { 'Retry-After': '2' } }))
      .mockResolvedValueOnce(new Response('ok', { status: 200 }))

    const promise = resilientFetch('https://example.com/retry-after', {}, { timeoutMs: 5_000, maxRetries: 1, fetchImpl, backoffMs: [50] })
    await vi.advanceTimersByTimeAsync(1_999)
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(10)
    await vi.runAllTimersAsync()
    const response = await promise

    expect(response.status).toBe(200)
    expect(fetchImpl).toHaveBeenCalledTimes(2)
    vi.useRealTimers()
  })

  it('throws ResilientFetchError after retries are exhausted', async () => {
    vi.useFakeTimers()
    const fetchImpl = vi.fn().mockResolvedValue(new Response('unavailable', { status: 503 }))

    const promise = resilientFetch('https://example.com/exhausted', {}, { timeoutMs: 5_000, maxRetries: 1, fetchImpl, backoffMs: [10] })
    const expectation = expect(promise).rejects.toBeInstanceOf(ResilientFetchError)
    await vi.runAllTimersAsync()
    await expectation

    expect(fetchImpl).toHaveBeenCalledTimes(2)
    vi.useRealTimers()
  })
})
