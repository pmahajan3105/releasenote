import { isSafeImageSrc, isSafeLinkHref } from './url-safety'

type SanitizableAttribute = {
  name: string
  value: string
}

export interface SanitizableElement {
  tagName: string
  attributes: ArrayLike<SanitizableAttribute>
  ownerDocument?: {
    createTextNode: (data: string) => Node
  } | null
  getAttribute: (name: string) => string | null
  setAttribute: (name: string, value: string) => void
  removeAttribute: (name: string) => void
  remove: () => void
  replaceWith?: (...nodes: (string | Node)[]) => void
}

const EVENT_HANDLER_ATTR_RE = /^on[a-z]/i

function parseSrcsetCandidates(srcset: string): string[] {
  return srcset
    .split(',')
    .map((entry) => entry.trim().split(/\s+/)[0] || '')
    .filter(Boolean)
}

export function isUnsafeAttributeName(name: string): boolean {
  return EVENT_HANDLER_ATTR_RE.test(name.trim())
}

export function isUnsafeAttributeValue(name: string, value: string): boolean {
  const attrName = name.trim().toLowerCase()
  const attrValue = value.trim()
  if (!attrValue) {
    return false
  }

  if (attrName === 'href' || attrName === 'xlink:href' || attrName === 'action' || attrName === 'formaction') {
    return !isSafeLinkHref(attrValue)
  }

  if (attrName === 'src') {
    return !isSafeImageSrc(attrValue)
  }

  if (attrName === 'srcset') {
    const candidates = parseSrcsetCandidates(attrValue)
    return candidates.some((candidate) => !isSafeImageSrc(candidate))
  }

  return false
}

function preserveInputFallbackText(node: SanitizableElement) {
  const fallbackText = node.getAttribute('value')?.trim() || node.getAttribute('placeholder')?.trim() || ''
  if (!fallbackText || !node.ownerDocument || typeof node.replaceWith !== 'function') {
    node.remove()
    return
  }

  node.replaceWith(node.ownerDocument.createTextNode(fallbackText))
}

export function applyCommonSanitizePolicies(node: SanitizableElement) {
  const href = node.getAttribute('href')
  if (href && !isSafeLinkHref(href)) {
    node.removeAttribute('href')
  }

  const src = node.getAttribute('src')
  if (src && !isSafeImageSrc(src)) {
    node.removeAttribute('src')
  }

  const srcset = node.getAttribute('srcset')
  if (srcset && parseSrcsetCandidates(srcset).some((candidate) => !isSafeImageSrc(candidate))) {
    node.removeAttribute('srcset')
  }

  if (node.tagName === 'A' && node.getAttribute('href')) {
    node.setAttribute('rel', 'noopener noreferrer')
  }

  // Task-list safety: allow checkbox visuals only. Strip interactive input controls.
  if (node.tagName === 'INPUT') {
    const inputType = (node.getAttribute('type') || '').toLowerCase()
    if (inputType !== 'checkbox') {
      preserveInputFallbackText(node)
      return
    }

    node.setAttribute('type', 'checkbox')
    node.setAttribute('disabled', '')
    node.setAttribute('tabindex', '-1')
    node.removeAttribute('name')
    node.removeAttribute('form')
  }
}
