import crypto from 'node:crypto'

const TOKEN_VERSION = 'v1'

function getSecret() {
  const secret = process.env.SUBSCRIBER_TOKEN_SECRET
  if (!secret) {
    throw new Error('SUBSCRIBER_TOKEN_SECRET is required')
  }
  return secret
}

function sign(payload: string) {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url')
}

export function createUnsubscribeToken(subscriberId: string) {
  const payload = `${TOKEN_VERSION}.${subscriberId}`
  const signature = sign(payload)
  return `${payload}.${signature}`
}

export function verifyUnsubscribeToken(token: string): { subscriberId: string } | null {
  const [version, subscriberId, signature] = token.split('.')

  if (!version || !subscriberId || !signature) return null
  if (version !== TOKEN_VERSION) return null

  const payload = `${version}.${subscriberId}`
  const expectedSignature = sign(payload)

  const a = Buffer.from(signature)
  const b = Buffer.from(expectedSignature)
  if (a.length !== b.length) return null

  // Constant-time compare to avoid oracle attacks.
  if (!crypto.timingSafeEqual(a, b)) return null

  return { subscriberId }
}

