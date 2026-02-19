import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { decryptCredentials, encryptCredentials } from '@/lib/integrations/credentials'
import { OAuthProviderConfigError, refreshProviderAccessToken } from '@/lib/integrations/oauth-client'
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
  try {
    return await refreshProviderAccessToken(provider, refreshToken)
  } catch (error) {
    if (error instanceof OAuthProviderConfigError) {
      throw new IntegrationTokenError({
        status: 500,
        code: 'not_configured',
        message: `${providerLabel(provider)} OAuth is not configured on this server.`,
      })
    }

    const details = error instanceof Error ? error.message : String(error)
    const shouldReauth = /invalid_grant|invalid_client|unauthorized|expired|revoked|reauth/i.test(details)

    throw new IntegrationTokenError({
      status: shouldReauth ? 400 : 502,
      code: shouldReauth ? 'reauth_required' : 'refresh_failed',
      message: `Failed to refresh ${providerLabel(provider)} token. Please reconnect your ${providerLabel(provider)} account.`,
      details,
    })
  }
}

function providerLabel(provider: IntegrationType): string {
  switch (provider) {
    case 'github':
      return 'GitHub'
    case 'jira':
      return 'Jira'
    case 'linear':
      return 'Linear'
  }
}
