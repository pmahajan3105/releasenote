// Minimal mock for fetch to work with Vitest: returns a Response-like object
export function mockFetchImpl(responses: Record<string, any>) {
  return (input: string | Request | URL, opts?: any) => {
    // Log every fetch call for debugging
    // eslint-disable-next-line no-console
    console.log('[mockFetchImpl] fetch input:', input)
    let urlStr: string
    if (typeof input === 'string') {
      urlStr = input
    } else if (input instanceof Request) {
      urlStr = input.url
    } else if (input instanceof URL) {
      urlStr = input.toString()
    } else {
      throw new Error('Unknown fetch input type: ' + typeof input)
    }
    // Log every fetch call for debugging
    // eslint-disable-next-line no-console
    console.log('[mockFetchImpl] fetch called:', urlStr)
    // Match by endpoint prefix (ignore query params)
    const urlObj = new URL(urlStr, 'http://localhost')
    const pathname = urlObj.pathname
    let key = Object.keys(responses).find(k => pathname === k || pathname.startsWith(k))
    if (!key) {
      // fallback to substring match for legacy
      key = Object.keys(responses).find(k => urlStr.includes(k))
    }
    if (key) {
      const response = responses[key](opts, urlStr)
      return Promise.resolve({
        ok: response.ok,
        json: () => Promise.resolve(response.body),
        status: response.status || 200,
        statusText: response.statusText || 'OK',
        headers: { get: () => null },
        redirected: false,
        type: 'basic',
        url: urlStr
      }) as any
    } else if (responses.catchAll) {
      // Use catchAll handler if present
      const response = responses.catchAll(opts, urlStr)
      return Promise.resolve({
        ok: response.ok,
        json: () => Promise.resolve(response.body),
        status: response.status || 404,
        statusText: response.statusText || 'Not Found',
        headers: { get: () => null },
        redirected: false,
        type: 'basic',
        url: urlStr
      }) as any
    } else {
      // fallback: unhandled URL
      // eslint-disable-next-line no-console
      console.warn('[test] mockFetchImpl: Unhandled fetch URL', urlStr)
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: `Unhandled fetch in mockFetchImpl: ${urlStr}` }),
        status: 404,
        statusText: 'Not Found',
        headers: { get: () => null },
        redirected: false,
        type: 'basic',
        url: urlStr
      }) as any
    }
  }
}

