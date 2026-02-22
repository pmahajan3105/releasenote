const SAFE_LINK_SCHEMES = new Set(['http:', 'https:', 'mailto:'])
const SAFE_IMAGE_SCHEMES = new Set(['http:', 'https:'])

function hasExplicitScheme(value: string): boolean {
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(value)
}

function getScheme(value: string): string | null {
  const match = /^([a-zA-Z][a-zA-Z\d+\-.]*):/.exec(value)
  return match ? `${match[1].toLowerCase()}:` : null
}

function isSafeRelativeUrl(value: string): boolean {
  if (value.startsWith('//')) {
    return false
  }

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
  if (/[\u0000-\u001F\u007F]/.test(href) || /\s/.test(href)) return false

  if (isSafeRelativeUrl(href)) {
    return true
  }

  const scheme = getScheme(href)
  if (!scheme) {
    return false
  }
  if (!SAFE_LINK_SCHEMES.has(scheme)) return false

  if (scheme === 'mailto:') {
    return /^mailto:[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/i.test(href)
  }

  const parsed = parseUrl(href)
  return Boolean(parsed && parsed.protocol === scheme)
}

export function isSafeImageSrc(value: string): boolean {
  const src = value.trim()
  if (!src) return false
  if (/[\u0000-\u001F\u007F]/.test(src) || /\s/.test(src)) return false

  if (isSafeRelativeUrl(src)) {
    return true
  }

  const scheme = getScheme(src)
  if (!scheme) {
    return false
  }
  if (!SAFE_IMAGE_SCHEMES.has(scheme)) return false

  const parsed = parseUrl(src)
  return Boolean(parsed && parsed.protocol === scheme)
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
