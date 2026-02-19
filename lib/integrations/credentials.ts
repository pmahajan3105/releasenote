import 'server-only'

import crypto from 'crypto'

export type EncryptedCredentialsV1 = {
  v: 1
  iv: string
  data: string
  tag: string
}

export type EncryptedCredentials = EncryptedCredentialsV1

type JsonRecord = Record<string, unknown>

function getEncryptionKey(): Buffer {
  const raw = process.env.INTEGRATIONS_ENCRYPTION_KEY
  if (!raw) {
    throw new Error('Missing INTEGRATIONS_ENCRYPTION_KEY')
  }

  const asHex = /^[0-9a-f]{64}$/i.test(raw) ? Buffer.from(raw, 'hex') : null
  const key = asHex ?? Buffer.from(raw, 'base64')

  if (key.length !== 32) {
    throw new Error('INTEGRATIONS_ENCRYPTION_KEY must be 32 bytes (base64 or 64-char hex)')
  }

  return key
}

export function encryptCredentials(payload: JsonRecord): EncryptedCredentialsV1 {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(12) // GCM standard nonce size

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const plaintext = Buffer.from(JSON.stringify(payload), 'utf8')
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()])
  const tag = cipher.getAuthTag()

  return {
    v: 1,
    iv: iv.toString('base64'),
    data: ciphertext.toString('base64'),
    tag: tag.toString('base64'),
  }
}

export function decryptCredentials(value: unknown): JsonRecord | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const record = value as Partial<EncryptedCredentialsV1>
  if (record.v !== 1 || typeof record.iv !== 'string' || typeof record.data !== 'string' || typeof record.tag !== 'string') {
    return null
  }

  const key = getEncryptionKey()
  const iv = Buffer.from(record.iv, 'base64')
  const data = Buffer.from(record.data, 'base64')
  const tag = Buffer.from(record.tag, 'base64')

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)

  const plaintext = Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8')
  const parsed = JSON.parse(plaintext)
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return null
  }

  return parsed as JsonRecord
}

export function getAccessTokenFromEncryptedCredentials(value: unknown): string | null {
  try {
    const decrypted = decryptCredentials(value)
    const token = decrypted?.access_token
    return typeof token === 'string' && token ? token : null
  } catch {
    return null
  }
}

