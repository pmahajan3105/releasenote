# Deployment Guide (Vercel + Supabase)

_Last updated: 2026-02-20_

This is the canonical deployment guide for the current stack.

## Target Architecture
- App + API: Next.js App Router deployed on Vercel
- Database/Auth/Storage: Supabase
- AI: OpenAI (configured model ID) primary, Azure OpenAI optional fallback
- Email: Resend

## Runtime Baseline
- Node.js `>=22.11.0`
- Next.js `16.x`
- React `19.x`

## 1) Prepare production accounts
- GitHub repository access
- Vercel project
- Supabase project
- OpenAI API key
- Resend API key + verified sender/domain
- OAuth apps for GitHub/Jira/Linear

## 2) Required production environment variables
Set in Vercel Project Settings -> Environment Variables.

### Core
```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>

AI_PROVIDER=openai
OPENAI_API_KEY=<openai_key>
OPENAI_MODEL=<openai-model-id>

RESEND_API_KEY=<resend_key>
RESEND_FROM_EMAIL=noreply@yourdomain.com
EMAIL_FROM=noreply@yourdomain.com

INTEGRATIONS_ENCRYPTION_KEY=<32-byte key as hex or base64>
SUBSCRIBER_TOKEN_SECRET=<random secret>

NEXT_PUBLIC_APP_URL=https://<your-domain>
```

### Integrations OAuth
```env
GITHUB_CLIENT_ID=<github_client_id>
GITHUB_CLIENT_SECRET=<github_client_secret>
GITHUB_REDIRECT_URL=https://<your-domain>/api/auth/github/callback

JIRA_CLIENT_ID=<jira_client_id>
JIRA_CLIENT_SECRET=<jira_client_secret>
JIRA_REDIRECT_URL=https://<your-domain>/api/auth/jira/callback

LINEAR_CLIENT_ID=<linear_client_id>
LINEAR_CLIENT_SECRET=<linear_client_secret>
LINEAR_REDIRECT_URL=https://<your-domain>/api/auth/linear/callback
```

### Optional Azure fallback
```env
AI_PROVIDER=azure-openai
AZURE_OPENAI_API_KEY=<azure_key>
AZURE_OPENAI_ENDPOINT=https://<resource>.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o-mini
AZURE_OPENAI_API_VERSION=2024-06-01
```

## 3) Deploy on Vercel
1. Import repository in Vercel.
2. Framework preset: Next.js.
3. Build command: `next build --webpack` (already wired by package scripts).
4. Add all env vars above for Production (and Preview if needed).
5. Deploy.

## 4) Configure Supabase for production
1. Apply migrations in `supabase/migrations`.
2. Verify RLS policies for organization-scoped tables.
3. Create required storage buckets (for release images/logos as used by app).
4. Confirm auth settings and site URL callback domain.

## 5) Configure OAuth providers
- Register callback URLs exactly as deployed domain values.
- Ensure scopes match expected route behavior:
  - GitHub repo access for commits/PRs
  - Jira project/issue read scopes
  - Linear issue/team read scopes

## 6) Post-deploy validation checklist
```bash
npm run typecheck
npm run lint
npm test -- --runInBand
npm run build
```
Then in deployed app:
1. Auth works (`/login`, `/signup`, `/auth/callback`).
2. Integrations connect and fetch data.
3. Release builder works at `/dashboard/releases/new`.
4. Generation uses `POST /api/release-notes/generate`.
5. Publish + notify works.
6. Public pages work:
   - `/notes/[org_slug]`
   - `/notes/[org_slug]/[release_slug]`

## 7) Operational notes
- `proxy.ts` applies security headers, route protection, and route-based rate limits.
- Legacy API shims return `410` intentionally (not deployment errors).
- Keep `NEXT_PUBLIC_APP_URL` accurate for OAuth callbacks and unsubscribe links.

## 8) Common deployment issues
- OAuth callback errors:
  - Usually redirect URL mismatch between env vars and provider app config.
- 401/403 on API routes:
  - Check Supabase session and organization membership rows.
- Email send errors:
  - Confirm Resend key and sender verification.
- Integration fetch failures:
  - Check stored credentials and provider permissions.

## 9) Rollback strategy
- Re-deploy previous successful Vercel deployment.
- Revert env var changes if incident is credential/config related.
- Keep DB migrations backward-compatible where possible before rollout.
