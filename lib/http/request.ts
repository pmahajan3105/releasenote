import pRetry, { AbortError } from 'p-retry'

export type RetryOptions = {
  retries?: number
  minTimeoutMs?: number
  maxTimeoutMs?: number
  respectRetryAfter?: boolean
  randomize?: boolean
}

export class HttpError extends Error {
  readonly name = 'HttpError'
  readonly status: number
  readonly retryAfterMs?: number

  constructor(params: { message: string; status: number; retryAfterMs?: number }) {
    super(params.message)
    this.status = params.status
    this.retryAfterMs = params.retryAfterMs
  }
}

export function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 429 || status === 500 || status === 502 || status === 503 || status === 504
}

export function getRetryAfterMs(headers: Headers): number | undefined {
  const value = headers.get('retry-after')
  if (!value) {
    return undefined
  }

  // `Retry-After` can be seconds or an HTTP-date.
  const asSeconds = Number(value)
  if (Number.isFinite(asSeconds)) {
    return Math.max(0, Math.round(asSeconds * 1000))
  }

  const asDate = Date.parse(value)
  if (Number.isFinite(asDate)) {
    return Math.max(0, asDate - Date.now())
  }

  return undefined
}

export async function withRetry<T>(
  fn: (attempt: number) => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const retries = options.retries ?? 3
  const minTimeoutMs = options.minTimeoutMs ?? 500
  const maxTimeoutMs = options.maxTimeoutMs ?? 8000
  const respectRetryAfter = options.respectRetryAfter ?? true
  const randomize = options.randomize ?? true

  let attempt = 0

  return pRetry(() => {
    attempt += 1
    return fn(attempt)
  }, {
    retries,
    // We manage all delay ourselves in `onFailedAttempt`.
    factor: 1,
    minTimeout: 0,
    maxTimeout: 0,
    randomize: false,
    shouldRetry: ({ error }) => shouldRetry(error),
    onFailedAttempt: async ({ error, attemptNumber }) => {
      const retryAfterMs = respectRetryAfter ? getRetryAfterFromError(error) : undefined
      const backoffMs = computeBackoffMs(attemptNumber, minTimeoutMs, maxTimeoutMs, randomize)
      const delayMs = retryAfterMs != null ? Math.max(retryAfterMs, backoffMs) : backoffMs
      await sleep(delayMs)
    },
  })
}

export async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

export async function fetchWithRetry(
  url: string,
  init: RequestInit,
  options: { timeoutMs?: number; retry?: RetryOptions } = {}
): Promise<Response> {
  const timeoutMs = options.timeoutMs ?? 30000
  const retry = options.retry ?? {}

  return withRetry(async () => {
    let response: Response

    try {
      response = await fetchWithTimeout(url, init, timeoutMs)
    } catch (error) {
      // Abort retries for timeouts/user cancellations.
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AbortError(error)
      }

      const message = error instanceof Error ? error.message : 'Unknown network error'
      throw new HttpError({ message: `Network error: ${message}`, status: 0 })
    }

    if (!response.ok && isRetryableStatus(response.status)) {
      const retryAfterMs = getRetryAfterMs(response.headers)
      throw new HttpError({
        message: `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
        retryAfterMs,
      })
    }

    return response
  }, retry)
}

function shouldRetry(error: unknown): boolean {
  if (error instanceof AbortError) {
    return false
  }

  if (error instanceof HttpError) {
    return error.status === 0 || isRetryableStatus(error.status)
  }

  if (error instanceof Error && error.name === 'AbortError') {
    return false
  }

  // Unknown error types should not be retried by default.
  return false
}

function getRetryAfterFromError(error: unknown): number | undefined {
  if (error instanceof HttpError) {
    return error.retryAfterMs
  }

  return undefined
}

function computeBackoffMs(attemptNumber: number, minTimeoutMs: number, maxTimeoutMs: number, randomize: boolean): number {
  // attemptNumber starts at 1 for the first failed attempt.
  const exp = Math.max(0, attemptNumber - 1)
  const base = Math.min(maxTimeoutMs, Math.round(minTimeoutMs * 2 ** exp))

  if (!randomize) {
    return base
  }

  // Jitter between 1x and 2x.
  const factor = 1 + Math.random()
  return Math.min(maxTimeoutMs, Math.round(base * factor))
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
