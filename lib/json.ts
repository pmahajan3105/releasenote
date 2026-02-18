export type JsonObject = Record<string, unknown>

export function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function getString(value: unknown, key: string): string | undefined {
  if (!isJsonObject(value)) {
    return undefined
  }

  const entry = value[key]
  return typeof entry === 'string' ? entry : undefined
}

export function getNumber(value: unknown, key: string): number | undefined {
  if (!isJsonObject(value)) {
    return undefined
  }

  const entry = value[key]
  return typeof entry === 'number' ? entry : undefined
}

export function getBoolean(value: unknown, key: string): boolean | undefined {
  if (!isJsonObject(value)) {
    return undefined
  }

  const entry = value[key]
  return typeof entry === 'boolean' ? entry : undefined
}

export function getArray(value: unknown, key: string): unknown[] | undefined {
  if (!isJsonObject(value)) {
    return undefined
  }

  const entry = value[key]
  return Array.isArray(entry) ? entry : undefined
}

