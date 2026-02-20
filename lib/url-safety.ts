const SAFE_LINK_SCHEMES = new Set(['http:', 'https:', 'mailto:'])
const SAFE_IMAGE_SCHEMES = new Set(['http:', 'https:'])

function hasExplicitScheme(value: string): boolean {
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(value)
}

function isSafeRelativeUrl(value: string): boolean {
  return (
    value.startsWith('/') ||
    value.startsWith('./') ||
    value.startsWith('../') ||
    value.startsWith('#')
  )
}

function parseUrl(value: string): URL | null {
  try {
    return new URL(value)
  } catch {
    return null
  }
}

export function isSafeLinkHref(value: string): boolean {
  const href = value.trim()
  if (!href) return false

  if (isSafeRelativeUrl(href)) {
    return true
  }

  if (!hasExplicitScheme(href)) {
    return false
  }

  const parsed = parseUrl(href)
  return Boolean(parsed && SAFE_LINK_SCHEMES.has(parsed.protocol))
}

export function isSafeImageSrc(value: string): boolean {
  const src = value.trim()
  if (!src) return false

  if (isSafeRelativeUrl(src)) {
    return true
  }

  if (!hasExplicitScheme(src)) {
    return false
  }

  const parsed = parseUrl(src)
  return Boolean(parsed && SAFE_IMAGE_SCHEMES.has(parsed.protocol))
}

export function normalizeEditorLinkInput(value: string): string | null {
  const input = value.trim()
  if (!input) return null

  if (isSafeLinkHref(input)) {
    return input
  }

  if (!hasExplicitScheme(input) && /^[^\s/$.?#].[^\s]*\.[a-z]{2,}/i.test(input)) {
    const normalized = `https://${input}`
    return isSafeLinkHref(normalized) ? normalized : null
  }

  return null
}
