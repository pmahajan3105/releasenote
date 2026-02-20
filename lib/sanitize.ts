import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'
import { SANITIZATION_CONFIG } from './constants'
import { isSafeImageSrc, isSafeLinkHref } from './url-safety'

// Create a singleton JSDOM window to avoid creating new instances on every call
let jsdomWindow: typeof window | null = null
let configuredPurify: ReturnType<typeof DOMPurify> | null = null

function configurePurifyInstance(purify: ReturnType<typeof DOMPurify>) {
  if ((purify as unknown as { __releaseNoteConfigured?: boolean }).__releaseNoteConfigured) {
    return
  }

  const ElementConstructor = getJSDOM().Element

  purify.addHook('afterSanitizeAttributes', (node) => {
    if (!(node instanceof ElementConstructor)) {
      return
    }

    const href = node.getAttribute('href')
    if (href && !isSafeLinkHref(href)) {
      node.removeAttribute('href')
    }

    const src = node.getAttribute('src')
    if (src && !isSafeImageSrc(src)) {
      node.removeAttribute('src')
    }

    if (node.tagName === 'A' && node.getAttribute('href')) {
      node.setAttribute('rel', 'noopener noreferrer')
    }
  })

  ;(purify as unknown as { __releaseNoteConfigured?: boolean }).__releaseNoteConfigured = true
}

function getJSDOM() {
  if (!jsdomWindow) {
    jsdomWindow = new JSDOM('').window as unknown as typeof window
  }
  return jsdomWindow
}

function getPurify() {
  if (!configuredPurify) {
    configuredPurify = DOMPurify(getJSDOM())
    configurePurifyInstance(configuredPurify)
  }

  return configuredPurify
}

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html - The HTML string to sanitize
 * @param options - Optional configuration to override default sanitization rules
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(
  html: string,
  options?: {
    allowedTags?: string[]
    allowedAttributes?: string[]
  }
): string {
  if (!html) return ''

  const purify = getPurify()

  const config = {
    ALLOWED_TAGS: options?.allowedTags || [...SANITIZATION_CONFIG.ALLOWED_TAGS],
    ALLOWED_ATTR: options?.allowedAttributes || [...SANITIZATION_CONFIG.ALLOWED_ATTR],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'meta'],
    FORBID_ATTR: ['style'],
  }

  return purify.sanitize(html, config)
}

/**
 * Sanitizes HTML content with strict settings (minimal tags allowed)
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string with only basic formatting
 */
export function sanitizeHtmlStrict(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ['p', 'br', 'strong', 'em', 'u'],
    allowedAttributes: []
  })
}

/**
 * Strips all HTML tags and returns plain text
 * @param html - The HTML string to convert to plain text
 * @returns Plain text string
 */
export function stripHtml(html: string): string {
  if (!html) return ''
  
  const window = getJSDOM()
  const purify = DOMPurify(window)
  
  return purify.sanitize(html, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  })
} 
