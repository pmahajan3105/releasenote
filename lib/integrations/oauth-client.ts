import 'server-only'

import * as oauth from 'oauth4webapi'
import { withProviderLimit, type ProviderKey } from '@/lib/http/limit'
import { fetchWithRetry } from '@/lib/http/request'

type OAuthProvider = ProviderKey

type OAuthProviderConfig = {
  issuer: string
  authorizationEndpoint: string
  tokenEndpoint: string
  clientIdEnv: string
  clientSecretEnv: string
}

const providerConfig: Record<OAuthProvider, OAuthProviderConfig> = {
  github: {
    issuer: 'https://github.com',
    authorizationEndpoint: 'https://github.com/login/oauth/authorize',
    tokenEndpoint: 'https://github.com/login/oauth/access_token',
    clientIdEnv: 'GITHUB_CLIENT_ID',
    clientSecretEnv: 'GITHUB_CLIENT_SECRET',
  },
  jira: {
    issuer: 'https://auth.atlassian.com',
    authorizationEndpoint: 'https://auth.atlassian.com/authorize',
    tokenEndpoint: 'https://auth.atlassian.com/oauth/token',
    clientIdEnv: 'JIRA_CLIENT_ID',
    clientSecretEnv: 'JIRA_CLIENT_SECRET',
  },
  linear: {
    issuer: 'https://api.linear.app',
    authorizationEndpoint: 'https://linear.app/oauth/authorize',
    tokenEndpoint: 'https://api.linear.app/oauth/token',
    clientIdEnv: 'LINEAR_CLIENT_ID',
    clientSecretEnv: 'LINEAR_CLIENT_SECRET',
  },
}

export class OAuthProviderConfigError extends Error {
  readonly provider: OAuthProvider

  constructor(provider: OAuthProvider, message: string) {
    super(message)
    this.name = 'OAuthProviderConfigError'
    this.provider = provider
  }
}

type OAuthTokenResult = {
  access_token: string
  refresh_token?: string
  expires_in?: number
  scope?: string
  token_type?: string
}

export async function exchangeAuthorizationCodeForTokens(
  provider: OAuthProvider,
  params: {
    code: string
    redirectUri: string
    codeVerifier?: string
  }
): Promise<OAuthTokenResult> {
  const config = providerConfig[provider]
  const { as, client, clientAuth } = getOAuthClient(config, provider)

  const callbackParameters = new URLSearchParams({ code: params.code })
  const tokenResponse = await oauth.authorizationCodeGrantRequest(
    as,
    client,
    clientAuth,
    callbackParameters,
    params.redirectUri,
    params.codeVerifier ?? oauth.nopkce,
    getTokenRequestOptions(provider)
  )

  const tokenSet = await oauth.processAuthorizationCodeResponse(as, client, tokenResponse)
  return normalizeTokenResult(tokenSet)
}

export async function refreshProviderAccessToken(
  provider: OAuthProvider,
  refreshToken: string
): Promise<OAuthTokenResult> {
  const config = providerConfig[provider]
  const { as, client, clientAuth } = getOAuthClient(config, provider)

  const tokenResponse = await oauth.refreshTokenGrantRequest(
    as,
    client,
    clientAuth,
    refreshToken,
    getTokenRequestOptions(provider)
  )

  const tokenSet = await oauth.processRefreshTokenResponse(as, client, tokenResponse)
  return normalizeTokenResult(tokenSet)
}

function getOAuthClient(config: OAuthProviderConfig, provider: OAuthProvider) {
  const clientId = process.env[config.clientIdEnv]
  const clientSecret = process.env[config.clientSecretEnv]

  if (!clientId || !clientSecret) {
    throw new OAuthProviderConfigError(
      provider,
      `${provider.toUpperCase()} OAuth is not configured on this server.`
    )
  }

  const as: oauth.AuthorizationServer = {
    issuer: config.issuer,
    authorization_endpoint: config.authorizationEndpoint,
    token_endpoint: config.tokenEndpoint,
  }
  const client: oauth.Client = { client_id: clientId }
  const clientAuth = oauth.ClientSecretPost(clientSecret)

  return { as, client, clientAuth }
}

function getTokenRequestOptions(provider: OAuthProvider): oauth.TokenEndpointRequestOptions {
  return {
    headers: {
      Accept: 'application/json',
    },
    [oauth.customFetch]: async (url, options) =>
      withProviderLimit(provider, () =>
        fetchWithRetry(url, options as RequestInit, {
          timeoutMs: 30_000,
          retry: {
            retries: 2,
            minTimeoutMs: 500,
            maxTimeoutMs: 8000,
            respectRetryAfter: true,
            randomize: true,
          },
        })
      ),
  }
}

function normalizeTokenResult(tokenSet: {
  access_token: string
  refresh_token?: string
  expires_in?: number
  scope?: string
  token_type?: string
}): OAuthTokenResult {
  return {
    access_token: tokenSet.access_token,
    refresh_token: tokenSet.refresh_token,
    expires_in: tokenSet.expires_in,
    scope: tokenSet.scope,
    token_type: tokenSet.token_type,
  }
}
