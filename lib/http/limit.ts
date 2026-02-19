import pLimit from 'p-limit'

export type ProviderKey = 'github' | 'linear' | 'jira'

type LimitFn = ReturnType<typeof pLimit>

const limits: Record<ProviderKey, LimitFn> = {
  github: pLimit(4),
  linear: pLimit(4),
  jira: pLimit(2),
}

export function withProviderLimit<T>(provider: ProviderKey, fn: () => Promise<T>): Promise<T> {
  return limits[provider](fn)
}

