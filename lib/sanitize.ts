import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'
import { SANITIZATION_CONFIG } from './constants'

// Create a singleton JSDOM window to avoid creating new instances on every call
let jsdomWindow: typeof window | null = null

function getJSDOM() {
  if (!jsdomWindow) {
    jsdomWindow = new JSDOM('').window as unknown as typeof window
  }
  return jsdomWindow
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

  const window = getJSDOM()
  const purify = DOMPurify(window)

  const config = {
    ALLOWED_TAGS: options?.allowedTags || [...SANITIZATION_CONFIG.ALLOWED_TAGS],
    ALLOWED_ATTR: options?.allowedAttributes || [...SANITIZATION_CONFIG.ALLOWED_ATTR]
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