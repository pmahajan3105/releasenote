import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { decryptCredentials, encryptCredentials } from '@/lib/integrations/credentials'
import { withProviderLimit } from '@/lib/http/limit'
import { fetchWithRetry } from '@/lib/http/request'
import type { Database } from '@/types/database'

type IntegrationRow = Database['public']['Tables']['integrations']['Row']
type IntegrationType = IntegrationRow['type']
type IntegrationRecordForRefresh = {
  id: string
  organization_id: string
  type: IntegrationType
  encrypted_credentials?: unknown | null
}

type RefreshableCredentials = {
  access_token: string
  refresh_token?: string
  expires_at?: string | null
  scope?: string
  token_type?: string
}

const refreshableCredentialsSchema = z
  .object({
    access_token: z.string().min(1),
    refresh_token: z.string().min(1).optional(),
    expires_at: z.string().optional().nullable(),
    scope: z.string().optional(),
    token_type: z.string().optional(),
  })
  .passthrough()

type ProviderRefreshResponse = {
  access_token: string
  refresh_token?: string
  expires_in?: number
  scope?: string
  token_type?: string
}

export type IntegrationTokenErrorCode = 'missing_token' | 'reauth_required' | 'not_configured' | 'refresh_failed'

export class IntegrationTokenError extends Error {
  readonly name = 'IntegrationTokenError'
  readonly status: number
  readonly code: IntegrationTokenErrorCode
  readonly details?: string

  constructor(params: { status: number; code: IntegrationTokenErrorCode; message: string; details?: string }) {
    super(params.message)
    this.status = params.status
    this.code = params.code
    this.details = params.details
  }
}

export async function ensureFreshIntegrationAccessToken(
  supabase: SupabaseClient<Database>,
  integration: IntegrationRecordForRefresh,
  fallbackAccessToken: string | null,
  options: { minTtlMs?: number } = {}
): Promise<string> {
  const minTtlMs = options.minTtlMs ?? 5 * 60 * 1000

  if (!integration.encrypted_credentials) {
    if (fallbackAccessToken) {
      return fallbackAccessToken
    }
    throw new IntegrationTokenError({
      status: 400,
      code: 'missing_token',
      message: 'Integration access token not found. Please reconnect your account.',
    })
  }

  const decrypted = decryptCredentials(integration.encrypted_credentials)
  const parsed = refreshableCredentialsSchema.safeParse(decrypted)
  if (!parsed.success) {
    if (fallbackAccessToken) {
      return fallbackAccessToken
    }
    throw new IntegrationTokenError({
      status: 400,
      code: 'missing_token',
      message: 'Integration access token is invalid. Please reconnect your account.',
    })
  }

  const current = parsed.data
  const accessToken = current.access_token || fallbackAccessToken
  if (!accessToken) {
    throw new IntegrationTokenError({
      status: 400,
      code: 'missing_token',
      message: 'Integration access token not found. Please reconnect your account.',
    })
  }

  const expiresAt = current.expires_at
  if (!expiresAt) {
    return accessToken
  }

  const expiresAtMs = Date.parse(expiresAt)
  if (!Number.isFinite(expiresAtMs)) {
    return accessToken
  }

  const ttlMs = expiresAtMs - Date.now()
  if (ttlMs > minTtlMs) {
    return accessToken
  }

  if (!current.refresh_token) {
    if (ttlMs > 0) {
      // Token is still valid; proceed without refresh.
      return accessToken
    }

    throw new IntegrationTokenError({
      status: 400,
      code: 'reauth_required',
      message: 'Integration token expired. Please reconnect your account.',
    })
  }

  const refreshed = await refreshAccessToken(integration.type, current.refresh_token)
  const refreshedExpiresAt =
    typeof refreshed.expires_in === 'number'
      ? new Date(Date.now() + refreshed.expires_in * 1000).toISOString()
      : null

  const nextCredentials: RefreshableCredentials = {
    ...current,
    access_token: refreshed.access_token,
    refresh_token: refreshed.refresh_token ?? current.refresh_token,
    expires_at: refreshedExpiresAt ?? current.expires_at ?? null,
    scope: refreshed.scope ?? current.scope,
    token_type: refreshed.token_type ?? current.token_type,
  }

  const encrypted_credentials = encryptCredentials(nextCredentials as Record<string, unknown>)
  const { error: updateError } = await supabase
    .from('integrations')
    .update({ encrypted_credentials, updated_at: new Date().toISOString() })
    .eq('id', integration.id)
    .eq('organization_id', integration.organization_id)

  if (updateError) {
    // Token is still valid, but we want visibility if we couldn't persist the refresh.
    console.error('Failed to persist refreshed integration token:', updateError)
  }

  return refreshed.access_token
}

async function refreshAccessToken(provider: IntegrationType, refreshToken: string): Promise<ProviderRefreshResponse> {
  switch (provider) {
    case 'github':
      return refreshGitHubToken(refreshToken)
    case 'linear':
      return refreshLinearToken(refreshToken)
    case 'jira':
      return refreshJiraToken(refreshToken)
  }
}

const gitHubTokenSchema = z
  .object({
    access_token: z.string().min(1),
    expires_in: z.number().optional(),
    refresh_token: z.string().min(1).optional(),
    scope: z.string().optional(),
    token_type: z.string().optional(),
  })
  .passthrough()

const gitHubErrorSchema = z
  .object({
    error: z.string(),
    error_description: z.string().optional(),
  })
  .passthrough()

async function refreshGitHubToken(refreshToken: string): Promise<ProviderRefreshResponse> {
  const clientId = process.env.GITHUB_CLIENT_ID
  const clientSecret = process.env.GITHUB_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new IntegrationTokenError({
      status: 500,
      code: 'not_configured',
      message: 'GitHub OAuth is not configured on this server.',
    })
  }

  const response = await withProviderLimit('github', () =>
    fetchWithRetry(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
        }),
      },
      {
        timeoutMs: 30000,
        retry: { retries: 2, minTimeoutMs: 500, maxTimeoutMs: 8000, respectRetryAfter: true, randomize: true },
      }
    )
  )

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const details = payload && typeof payload === 'object' ? JSON.stringify(payload) : response.statusText
    throw new IntegrationTokenError({
      status: response.status >= 500 ? 502 : 400,
      code: response.status >= 500 ? 'refresh_failed' : 'reauth_required',
      message: 'Failed to refresh GitHub token. Please reconnect your GitHub account.',
      details,
    })
  }

  const asError = gitHubErrorSchema.safeParse(payload)
  if (asError.success) {
    throw new IntegrationTokenError({
      status: 400,
      code: 'reauth_required',
      message: 'Failed to refresh GitHub token. Please reconnect your GitHub account.',
      details: asError.data.error_description ?? asError.data.error,
    })
  }

  const parsed = gitHubTokenSchema.safeParse(payload)
  if (!parsed.success) {
    throw new IntegrationTokenError({
      status: 502,
      code: 'refresh_failed',
      message: 'GitHub returned an unexpected token refresh response.',
    })
  }

  return parsed.data
}

const linearTokenSchema = z
  .object({
    access_token: z.string().min(1),
    expires_in: z.number().optional(),
    refresh_token: z.string().min(1).optional(),
    scope: z.string().optional(),
    token_type: z.string().optional(),
  })
  .passthrough()

async function refreshLinearToken(refreshToken: string): Promise<ProviderRefreshResponse> {
  const clientId = process.env.LINEAR_CLIENT_ID
  const clientSecret = process.env.LINEAR_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new IntegrationTokenError({
      status: 500,
      code: 'not_configured',
      message: 'Linear OAuth is not configured on this server.',
    })
  }

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
  })

  const response = await withProviderLimit('linear', () =>
    fetchWithRetry(
      'https://api.linear.app/oauth/token',
      {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      },
      {
        timeoutMs: 30000,
        retry: { retries: 2, minTimeoutMs: 500, maxTimeoutMs: 8000, respectRetryAfter: true, randomize: true },
      }
    )
  )

  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    const details = payload && typeof payload === 'object' ? JSON.stringify(payload) : response.statusText
    throw new IntegrationTokenError({
      status: response.status >= 500 ? 502 : 400,
      code: response.status >= 500 ? 'refresh_failed' : 'reauth_required',
      message: 'Failed to refresh Linear token. Please reconnect your Linear account.',
      details,
    })
  }

  const parsed = linearTokenSchema.safeParse(payload)
  if (!parsed.success) {
    throw new IntegrationTokenError({
      status: 502,
      code: 'refresh_failed',
      message: 'Linear returned an unexpected token refresh response.',
    })
  }

  return parsed.data
}

const jiraTokenSchema = z
  .object({
    access_token: z.string().min(1),
    expires_in: z.number().optional(),
    refresh_token: z.string().min(1).optional(),
    scope: z.string().optional(),
    token_type: z.string().optional(),
  })
  .passthrough()

async function refreshJiraToken(refreshToken: string): Promise<ProviderRefreshResponse> {
  const clientId = process.env.JIRA_CLIENT_ID
  const clientSecret = process.env.JIRA_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new IntegrationTokenError({
      status: 500,
      code: 'not_configured',
      message: 'Jira OAuth is not configured on this server.',
    })
  }

  const response = await withProviderLimit('jira', () =>
    fetchWithRetry(
      'https://auth.atlassian.com/oauth/token',
      {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
        }),
      },
      {
        timeoutMs: 30000,
        retry: { retries: 2, minTimeoutMs: 500, maxTimeoutMs: 8000, respectRetryAfter: true, randomize: true },
      }
    )
  )

  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    const details = payload && typeof payload === 'object' ? JSON.stringify(payload) : response.statusText
    throw new IntegrationTokenError({
      status: response.status >= 500 ? 502 : 400,
      code: response.status >= 500 ? 'refresh_failed' : 'reauth_required',
      message: 'Failed to refresh Jira token. Please reconnect your Jira account.',
      details,
    })
  }

  const parsed = jiraTokenSchema.safeParse(payload)
  if (!parsed.success) {
    throw new IntegrationTokenError({
      status: 502,
      code: 'refresh_failed',
      message: 'Jira returned an unexpected token refresh response.',
    })
  }

  return parsed.data
}
