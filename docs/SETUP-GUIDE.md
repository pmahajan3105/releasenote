# Setup Guide (Current Stack)

_Last updated: 2026-02-20_

This is the canonical local setup guide for this repository.

## Stack Baseline
- Node.js: `>=22.11.0`
- npm: `>=10.9.0`
- Next.js: `16.x`
- React: `19.x`
- Auth/session helpers: `@supabase/ssr` (not deprecated auth helpers)
- AI provider: OpenAI (configured model ID) primary, Azure OpenAI optional fallback

## 1) Prerequisites
- Git
- Node 22+
- npm 10+
- Docker Desktop (required for local Supabase CLI stack)
- Accounts/keys:
  - Supabase project
  - OpenAI API key
  - Resend API key
  - GitHub/Jira/Linear OAuth app credentials (if testing integrations)

## 2) Install and bootstrap
```bash
git clone https://github.com/pmahajan3105/releasenote.git
cd releasenote
npm install
cp .env.example .env.local
```

## 3) Required environment variables
Set these in `.env.local`.

### Core required
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
SUBSCRIBER_TOKEN_SECRET=<32+ char random secret>

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### OAuth required for integrations
```env
GITHUB_CLIENT_ID=<github_client_id>
GITHUB_CLIENT_SECRET=<github_client_secret>
GITHUB_REDIRECT_URL=http://localhost:3000/api/auth/github/callback

JIRA_CLIENT_ID=<jira_client_id>
JIRA_CLIENT_SECRET=<jira_client_secret>
JIRA_REDIRECT_URL=http://localhost:3000/api/auth/jira/callback

LINEAR_CLIENT_ID=<linear_client_id>
LINEAR_CLIENT_SECRET=<linear_client_secret>
LINEAR_REDIRECT_URL=http://localhost:3000/api/auth/linear/callback
```

Secret format guidance:
- `INTEGRATIONS_ENCRYPTION_KEY`: 32-byte key (hex or base64).
- `SUBSCRIBER_TOKEN_SECRET`: at least 32 random characters (for example `openssl rand -base64 32`).

### Optional Azure OpenAI fallback
```env
AI_PROVIDER=azure-openai
AZURE_OPENAI_API_KEY=<azure_key>
AZURE_OPENAI_ENDPOINT=https://<resource>.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o-mini
AZURE_OPENAI_API_VERSION=2024-06-01
```

## 4) Database setup

### Option A: Local Supabase CLI (recommended for development)
```bash
npx supabase start
npx supabase db reset
```
`db reset` applies local migrations from `supabase/migrations` (and seed, if configured).

### Option B: Hosted Supabase
- Use your hosted project.
- Apply migrations in order from `supabase/migrations`.

## 5) Start app
```bash
npm run dev
```
Open `http://localhost:3000`.

## 6) Validate local health
```bash
npm run typecheck
npm run lint
npm test -- --runInBand
npm run build
```

## 7) Integration smoke test
1. Sign up/login.
2. Finish onboarding.
3. Connect GitHub/Jira/Linear from `/dashboard/integrations`.
4. Use `/dashboard/releases/new` and fetch items.
5. Generate draft via canonical endpoint `POST /api/release-notes/generate`.

## 8) Troubleshooting
- `ENOTFOUND registry.npmjs.org`:
  - `npm config set registry https://registry.npmjs.org/`
  - `npm ping`
- OAuth callback mismatch:
  - Ensure redirect URLs in provider apps exactly match `.env.local`.
- Empty integration results:
  - Verify provider account permissions and selected repos/projects/teams.
- Email test failures:
  - Confirm `RESEND_API_KEY` and sender domain/email are verified.
- Supabase auth/session issues:
  - Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are from the same project.

## 9) Security notes for local dev
- Never commit `.env.local`.
- Keep encryption secrets (`INTEGRATIONS_ENCRYPTION_KEY`, `SUBSCRIBER_TOKEN_SECRET`) non-default.
- Treat any example secrets in docs as placeholders only.
