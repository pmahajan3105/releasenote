'use client'

import DOMPurify from 'dompurify'
import { SANITIZATION_CONFIG } from './constants'
import { applyCommonSanitizePolicies } from './sanitize-policies'

let configuredPurify: ReturnType<typeof DOMPurify> | null = null

function getPurify() {
  if (!configuredPurify) {
    const purify = DOMPurify(window)
    purify.addHook('afterSanitizeAttributes', (node) => {
      if (!(node instanceof window.Element)) {
        return
      }
      applyCommonSanitizePolicies(node)
    })
    configuredPurify = purify
  }

  return configuredPurify
}

export function sanitizeHtmlClient(html: string): string {
  if (!html) return ''

  return getPurify().sanitize(html, {
    ALLOWED_TAGS: [...SANITIZATION_CONFIG.ALLOWED_TAGS],
    ALLOWED_ATTR: [...SANITIZATION_CONFIG.ALLOWED_ATTR],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'meta'],
    FORBID_ATTR: ['style'],
  })
}
