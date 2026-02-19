import 'server-only'

import crypto from 'crypto'

function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

/**
 * Creates a PKCE verifier/challenge pair (S256).
 *
 * This is intentionally dependency-free so it can run in restricted environments.
 */
export function createPkcePair(): { verifier: string; challenge: string; method: 'S256' } {
  // 32 bytes -> 43 char base64url; within RFC 7636 [43,128] verifier length.
  const verifier = base64UrlEncode(crypto.randomBytes(32))
  const challenge = base64UrlEncode(crypto.createHash('sha256').update(verifier).digest())

  return { verifier, challenge, method: 'S256' }
}

