type EnumValue<T extends string> = T

export function parseIntegerParam(
  value: string | null,
  fallback: number,
  options: {
    min?: number
    max?: number
  } = {}
): number {
  const parsed = Number.parseInt(value ?? '', 10)
  if (Number.isNaN(parsed)) {
    return fallback
  }

  const min = options.min ?? Number.NEGATIVE_INFINITY
  const max = options.max ?? Number.POSITIVE_INFINITY
  return Math.min(max, Math.max(min, parsed))
}

export function parseCsvParam(value: string | null): string[] | undefined {
  if (!value) {
    return undefined
  }

  const values = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  return values.length > 0 ? values : undefined
}

export function parseEnumParam<T extends string>(
  value: string | null,
  allowed: readonly EnumValue<T>[],
  fallback?: EnumValue<T>
): EnumValue<T> | undefined {
  if (value && allowed.includes(value as EnumValue<T>)) {
    return value as EnumValue<T>
  }

  return fallback
}

export function parseBooleanParam(value: string | null, fallback = false): boolean {
  if (value == null) {
    return fallback
  }

  const normalized = value.trim().toLowerCase()
  if (['true', '1', 'yes', 'y', 'on'].includes(normalized)) {
    return true
  }

  if (['false', '0', 'no', 'n', 'off'].includes(normalized)) {
    return false
  }

  return fallback
}
