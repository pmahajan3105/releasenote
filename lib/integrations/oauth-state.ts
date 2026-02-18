import 'server-only'

import crypto from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type OAuthProvider = 'github' | 'jira' | 'linear'

export type OAuthStateRecord = {
  state: string
  provider: OAuthProvider
  user_id: string
  expires_at: string
  pkce_verifier: string | null
}

export function createOAuthState(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function persistOAuthState(
  supabase: SupabaseClient<Database>,
  params: {
    provider: OAuthProvider
    state: string
    userId: string
    pkceVerifier?: string | null
    ttlMs?: number
  }
): Promise<void> {
  const ttlMs = typeof params.ttlMs === 'number' ? params.ttlMs : 10 * 60 * 1000

  const { error } = await supabase.from('oauth_states').insert({
    state: params.state,
    provider: params.provider,
    user_id: params.userId,
    pkce_verifier: params.pkceVerifier ?? null,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + ttlMs).toISOString(),
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function consumeOAuthState(
  supabase: SupabaseClient<Database>,
  params: { provider: OAuthProvider; state: string; userId: string }
): Promise<{ ok: true; record: OAuthStateRecord } | { ok: false; error: 'invalid_state' | 'expired_state' }> {
  const { data, error } = await supabase
    .from('oauth_states')
    .select('state, provider, user_id, expires_at, pkce_verifier')
    .eq('state', params.state)
    .eq('provider', params.provider)
    .single()

  if (error || !data || typeof data !== 'object') {
    return { ok: false, error: 'invalid_state' }
  }

  const record = data as Partial<OAuthStateRecord>
  if (
    typeof record.state !== 'string' ||
    record.provider !== params.provider ||
    typeof record.user_id !== 'string' ||
    typeof record.expires_at !== 'string'
  ) {
    return { ok: false, error: 'invalid_state' }
  }

  if (record.user_id !== params.userId) {
    return { ok: false, error: 'invalid_state' }
  }

  if (new Date(record.expires_at) < new Date()) {
    await supabase.from('oauth_states').delete().eq('state', params.state).eq('provider', params.provider)
    return { ok: false, error: 'expired_state' }
  }

  await supabase.from('oauth_states').delete().eq('state', params.state).eq('provider', params.provider)
  return {
    ok: true,
    record: {
      ...(record as OAuthStateRecord),
      pkce_verifier: typeof record.pkce_verifier === 'string' ? record.pkce_verifier : null,
    },
  }
}
