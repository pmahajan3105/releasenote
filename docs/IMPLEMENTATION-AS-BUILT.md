# Implementation & User Journey (As-Built)

_Generated: 2026-02-20_

## Purpose and Audience
This document is the canonical as-built reference for Engineering and Product.
It describes current journeys, current page/API surfaces, and current security/legacy behavior.

Canonical terms used: **Release Note**, **Organization**, **Integration**, **Published Note**, **Public Notes**.

## System at a Glance
```mermaid
flowchart LR
  U[App User] --> P[Next.js App Router Pages]
  P --> A[API Routes in app/api]
  A --> S[(Supabase: Auth + Postgres + Storage)]
  A --> I[Integrations: GitHub, Jira, Linear]
  A --> O[OpenAI Responses API configured model]
  A --> Z[Azure OpenAI fallback]
  A --> E[Resend]
  R[Public Reader] --> N[/notes/[org_slug] and /notes/[org_slug]/[release_slug]]
  N --> A
  X[proxy.ts] --> P
```

## Primary User Journeys

### 1) Sign up/login -> onboarding -> dashboard
- Entry routes: `/signup`, `/login`, `/auth/callback`, `/onboarding`, `/dashboard`
- Happy path:
  1. User authenticates via Supabase magic link.
  2. Callback resolves session.
  3. Onboarding creates the organization if missing.
  4. User lands in `/dashboard`.
- Code pointers:
  - `app/signup/page.tsx`
  - `app/login/page.tsx`
  - `app/auth/callback/route.ts`
  - `app/onboarding/page.tsx`
  - `app/dashboard/page.tsx`

### 2) Connect GitHub/Jira/Linear
- Entry routes: `/dashboard/integrations`, `/api/auth/github`, `/api/auth/jira`, `/api/auth/linear`
- Happy path:
  1. User starts OAuth from integrations UI.
  2. Callback exchanges code and stores encrypted credentials.
  3. Test/data endpoints are used for repositories/projects/issues/teams.
- Code pointers:
  - `app/dashboard/integrations/page.tsx`
  - `app/api/auth/github/route.ts`
  - `app/api/auth/jira/route.ts`
  - `app/api/auth/linear/route.ts`
  - `app/api/integrations/**/route.ts`

### 3) Create -> generate -> edit draft
- Canonical builder route: `/dashboard/releases/new`
- Legacy entrypoints now redirect:
  - `/dashboard/releases/start` -> `/dashboard/releases/new`
  - `/dashboard/releases/new/ai` -> `/dashboard/releases/new?intent=ai`
  - `/dashboard/releases/new/scratch` -> `/dashboard/releases/new?intent=scratch`
  - `/dashboard/releases/new/template` -> `/dashboard/releases/new?intent=template`
  - `/release-notes/create` -> `/dashboard/releases/new?intent=scratch`
- Happy path:
  1. Select source/filter and fetch items.
  2. Generate draft via `POST /api/release-notes/generate`.
  3. Save draft and open editor `/dashboard/releases/edit/[id]`.
- Code pointers:
  - `app/dashboard/releases/new/release-builder-client.tsx`
  - `app/api/release-notes/generate/route.ts`
  - `app/dashboard/releases/edit/[id]/page.tsx`

### 4) Publish and notify subscribers
- Entry points: editor publish flow -> `/api/release-notes/[id]/publish` -> `/api/release-notes/[id]/notify`
- Happy path:
  1. Publish endpoint sets published state.
  2. Notify endpoint sends Resend emails to active subscribers.
  3. Unsubscribe path uses tokenized links.
- Code pointers:
  - `app/api/release-notes/[id]/publish/route.ts`
  - `app/api/release-notes/[id]/notify/route.ts`
  - `app/api/subscribers/route.ts`
  - `app/api/subscribers/unsubscribe/route.ts`

### 5) Public notes consumption
- Entry routes: `/notes/[org_slug]`, `/notes/[org_slug]/[release_slug]`
- Happy path:
  1. Public list page renders published notes.
  2. Detail page renders sanitized HTML.
  3. Metadata generated for SEO/OG.
- Code pointers:
  - `app/notes/[org_slug]/page.tsx`
  - `app/notes/[org_slug]/[release_slug]/page.tsx`
  - `components/public/enhanced-release-notes-list.tsx`

## Route Inventory (Current)

### Pages

| Route | File | Status | Notes |
|---|---|---|---|
| `/ai-context` | `app/ai-context/page.tsx` | `redirect` | redirect/compat shim |
| `/configuration` | `app/configuration/page.tsx` | `redirect` | redirect/compat shim |
| `/dashboard/ai-context` | `app/dashboard/ai-context/page.tsx` | `active` | active page |
| `/dashboard/ai-customization` | `app/dashboard/ai-customization/page.tsx` | `redirect` | redirect/compat shim |
| `/dashboard/configuration` | `app/dashboard/configuration/page.tsx` | `active` | active page |
| `/dashboard/integrations` | `app/dashboard/integrations/page.tsx` | `active` | active page |
| `/dashboard` | `app/dashboard/page.tsx` | `active` | active page |
| `/dashboard/releases/edit/[id]` | `app/dashboard/releases/edit/[id]/page.tsx` | `active` | active page |
| `/dashboard/releases/new/ai` | `app/dashboard/releases/new/ai/page.tsx` | `redirect` | legacy entrypoint -> `/dashboard/releases/new?intent=ai` |
| `/dashboard/releases/new` | `app/dashboard/releases/new/page.tsx` | `active` | canonical release builder |
| `/dashboard/releases/new/scratch` | `app/dashboard/releases/new/scratch/page.tsx` | `redirect` | legacy entrypoint -> `/dashboard/releases/new?intent=scratch` |
| `/dashboard/releases/new/template` | `app/dashboard/releases/new/template/page.tsx` | `redirect` | legacy entrypoint -> `/dashboard/releases/new?intent=template` |
| `/dashboard/releases` | `app/dashboard/releases/page.tsx` | `active` | active page |
| `/dashboard/releases/start` | `app/dashboard/releases/start/page.tsx` | `redirect` | legacy entrypoint -> `/dashboard/releases/new` |
| `/dashboard/settings` | `app/dashboard/settings/page.tsx` | `active` | active page |
| `/dashboard/templates` | `app/dashboard/templates/page.tsx` | `active` | active page |
| `/integrations/manage` | `app/integrations/manage/page.tsx` | `redirect` | redirect/compat shim |
| `/integrations/new` | `app/integrations/new/page.tsx` | `redirect` | redirect/compat shim |
| `/integrations` | `app/integrations/page.tsx` | `redirect` | redirect/compat shim |
| `/login` | `app/login/page.tsx` | `active` | active page |
| `/notes/[org_slug]/[release_slug]` | `app/notes/[org_slug]/[release_slug]/page.tsx` | `active` | active page |
| `/notes/[org_slug]` | `app/notes/[org_slug]/page.tsx` | `active` | active page |
| `/onboarding` | `app/onboarding/page.tsx` | `active` | active page |
| `/` | `app/page.tsx` | `active` | active page |
| `/release-notes/create` | `app/release-notes/create/page.tsx` | `redirect` | legacy entrypoint -> `/dashboard/releases/new?intent=scratch` |
| `/release-notes/published` | `app/release-notes/published/page.tsx` | `redirect` | redirect/compat shim |
| `/releases/new/ai` | `app/releases/new/ai/page.tsx` | `redirect` | redirect/compat shim |
| `/releases/new` | `app/releases/new/page.tsx` | `redirect` | redirect/compat shim |
| `/releases/new/scratch` | `app/releases/new/scratch/page.tsx` | `redirect` | redirect/compat shim |
| `/releases/new/template` | `app/releases/new/template/page.tsx` | `redirect` | redirect/compat shim |
| `/releases` | `app/releases/page.tsx` | `redirect` | redirect/compat shim |
| `/settings/ai-customization` | `app/settings/ai-customization/page.tsx` | `redirect` | redirect/compat shim |
| `/settings` | `app/settings/page.tsx` | `redirect` | redirect/compat shim |
| `/signup` | `app/signup/page.tsx` | `active` | active page |
| `/templates` | `app/templates/page.tsx` | `redirect` | redirect/compat shim |
| `/unsubscribe` | `app/unsubscribe/page.tsx` | `active` | active page |

### APIs

| Endpoint | Methods | File | Status | Notes |
|---|---|---|---|---|
| `/api/ai-context` | `GET,POST` | `app/api/ai-context/route.ts` | `active` | active route |
| `/api/ai/analyze-content` | `POST,PATCH` | `app/api/ai/analyze-content/route.ts` | `active` | active route |
| `/api/ai/generate-with-brand-voice` | `POST` | `app/api/ai/generate-with-brand-voice/route.ts` | `active` | specialized AI helper |
| `/api/ai/generate-with-custom-prompt` | `POST` | `app/api/ai/generate-with-custom-prompt/route.ts` | `active` | specialized AI helper |
| `/api/ai/generate` | `POST,PATCH` | `app/api/ai/generate/route.ts` | `legacy-410` | removed; use `/api/release-notes/generate` |
| `/api/ai/improve-content` | `POST,PATCH` | `app/api/ai/improve-content/route.ts` | `active` | active route |
| `/api/auth/github/callback` | `GET` | `app/api/auth/github/callback/route.ts` | `active` | active route |
| `/api/auth/github` | `GET` | `app/api/auth/github/route.ts` | `active` | active route |
| `/api/auth/jira/callback` | `GET` | `app/api/auth/jira/callback/route.ts` | `active` | active route |
| `/api/auth/jira` | `GET` | `app/api/auth/jira/route.ts` | `active` | active route |
| `/api/auth/linear/callback` | `GET` | `app/api/auth/linear/callback/route.ts` | `active` | active route |
| `/api/auth/linear` | `GET` | `app/api/auth/linear/route.ts` | `active` | active route |
| `/api/brand-voices/[id]` | `GET,PUT,DELETE` | `app/api/brand-voices/[id]/route.ts` | `active` | active route |
| `/api/brand-voices` | `GET,POST` | `app/api/brand-voices/route.ts` | `active` | active route |
| `/api/categories` | `GET,POST` | `app/api/categories/route.ts` | `active` | active route |
| `/api/cron/ssl-renewal` | `GET,POST` | `app/api/cron/ssl-renewal/route.ts` | `active` | active route |
| `/api/csrf-token` | `GET` | `app/api/csrf-token/route.ts` | `active` | active route |
| `/api/custom-prompts` | `GET,POST` | `app/api/custom-prompts/route.ts` | `active` | active route |
| `/api/domain-lookup` | `GET` | `app/api/domain-lookup/route.ts` | `active` | active route |
| `/api/domain-settings` | `GET,PUT` | `app/api/domain-settings/route.ts` | `legacy-410` | removed; use org-scoped domain routes |
| `/api/github/generate-release-notes` | `POST` | `app/api/github/generate-release-notes/route.ts` | `legacy-410` | removed; use integration fetch + `/api/release-notes/generate` |
| `/api/github/repositories` | `GET` | `app/api/github/repositories/route.ts` | `legacy-410` | removed; use `/api/integrations/github/repositories` |
| `/api/health` | `GET` | `app/api/health/route.ts` | `active` | active route |
| `/api/integrations/github/health` | `POST` | `app/api/integrations/github/health/route.ts` | `active` | active route |
| `/api/integrations/github/repositories/[owner]/[repo]/commits` | `GET` | `app/api/integrations/github/repositories/[owner]/[repo]/commits/route.ts` | `active` | active route |
| `/api/integrations/github/repositories/[owner]/[repo]/pulls` | `GET` | `app/api/integrations/github/repositories/[owner]/[repo]/pulls/route.ts` | `active` | active route |
| `/api/integrations/github/repositories` | `GET` | `app/api/integrations/github/repositories/route.ts` | `active` | active route |
| `/api/integrations/github/test-connection` | `POST` | `app/api/integrations/github/test-connection/route.ts` | `active` | active route |
| `/api/integrations/jira/issues` | `GET` | `app/api/integrations/jira/issues/route.ts` | `active` | active route |
| `/api/integrations/jira/projects` | `GET` | `app/api/integrations/jira/projects/route.ts` | `active` | active route |
| `/api/integrations/jira/test-connection` | `POST` | `app/api/integrations/jira/test-connection/route.ts` | `active` | active route |
| `/api/integrations/linear/issues` | `GET` | `app/api/integrations/linear/issues/route.ts` | `active` | active route |
| `/api/integrations/linear/teams` | `GET` | `app/api/integrations/linear/teams/route.ts` | `active` | active route |
| `/api/integrations/linear/test-connection` | `POST` | `app/api/integrations/linear/test-connection/route.ts` | `active` | active route |
| `/api/organizations/[id]/custom-css` | `GET,PUT,DELETE` | `app/api/organizations/[id]/custom-css/route.ts` | `active` | active route |
| `/api/organizations/[id]/domain` | `GET,PUT,DELETE` | `app/api/organizations/[id]/domain/route.ts` | `active` | active route |
| `/api/organizations/[id]/domain/verify` | `POST` | `app/api/organizations/[id]/domain/verify/route.ts` | `active` | active route |
| `/api/organizations/[id]/meta` | `GET,PUT` | `app/api/organizations/[id]/meta/route.ts` | `active` | active route |
| `/api/organizations/[id]/settings` | `GET,PUT` | `app/api/organizations/[id]/settings/route.ts` | `active` | active route |
| `/api/organizations/[id]/ssl` | `GET,POST,DELETE` | `app/api/organizations/[id]/ssl/route.ts` | `active` | active route |
| `/api/organizations/[id]/upload-logo` | `POST` | `app/api/organizations/[id]/upload-logo/route.ts` | `active` | active route |
| `/api/release-notes/[id]/notify` | `POST` | `app/api/release-notes/[id]/notify/route.ts` | `active` | active route |
| `/api/release-notes/[id]/publish` | `POST` | `app/api/release-notes/[id]/publish/route.ts` | `active` | active route |
| `/api/release-notes/[id]` | `GET,PUT,DELETE` | `app/api/release-notes/[id]/route.ts` | `active` | active route |
| `/api/release-notes/generate` | `POST` | `app/api/release-notes/generate/route.ts` | `active` | canonical AI generation endpoint |
| `/api/release-notes/init` | `GET` | `app/api/release-notes/init/route.ts` | `active` | active route |
| `/api/release-notes` | `GET,POST` | `app/api/release-notes/route.ts` | `active` | active route |
| `/api/sso-settings` | `GET,PUT` | `app/api/sso-settings/route.ts` | `legacy-410` | removed; use org-scoped settings/meta routes |
| `/api/subscribers` | `GET,POST` | `app/api/subscribers/route.ts` | `active` | active route |
| `/api/subscribers/unsubscribe` | `POST` | `app/api/subscribers/unsubscribe/route.ts` | `active` | active route |
| `/api/templates/[id]` | `PUT,DELETE` | `app/api/templates/[id]/route.ts` | `active` | active route |
| `/api/templates` | `GET,POST` | `app/api/templates/route.ts` | `active` | active route |
| `/api/test-email` | `GET,POST` | `app/api/test-email/route.ts` | `active` | active route |
| `/api/v1/integrations` | `GET` | `app/api/v1/integrations/route.ts` | `legacy-410` | removed |
| `/api/v1/organizations/setup` | `POST` | `app/api/v1/organizations/setup/route.ts` | `legacy-410` | removed |
| `/api/v1/release-notes/generate` | `POST` | `app/api/v1/release-notes/generate/route.ts` | `legacy-410` | removed |
| `/api/v1/release-notes/save` | `POST` | `app/api/v1/release-notes/save/route.ts` | `legacy-410` | removed |
| `/auth/callback` | `GET` | `app/auth/callback/route.ts` | `active` | active route |

## Security, Auth, and Operational Controls
- Route/auth/rate-limit control is enforced in `proxy.ts`.
- Protected web surfaces include `/dashboard`, `/releases`, `/release-notes`, `/settings`, `/integrations`, `/configuration`, `/ai-context`, `/templates`.
- API content-type enforcement for JSON requests is handled in `proxy.ts`.
- Rate limiting tiers are applied for auth/API/public traffic in `lib/security/edge.ts` via `proxy.ts`.
- Server-side HTML sanitization is centralized in `lib/sanitize.ts`.
- Client preview sanitization is applied via `lib/sanitize-client.ts`.
- URL protocol safety checks are centralized in `lib/url-safety.ts` and used for link/image validation.
- Legacy insecure/demo APIs were retired to `410` (`/api/domain-settings`, `/api/sso-settings`).

## Legacy and Compatibility Summary
- Legacy UI routes remain as redirects to canonical dashboard routes.
- Legacy generation and v1 endpoints now return `410 Gone` with migration guidance.
- Canonical generation contract is `POST /api/release-notes/generate`.

## Known Risks and Prioritized Gaps
- P1: Some non-canonical AI helper routes still exist (`/api/ai/analyze-content`, `/api/ai/improve-content`, brand/custom prompt helpers), which increases API surface area.
- P1: Legacy redirect surface is still broad; route namespace can be simplified further over time.
- P2: `proxy.ts` protected route matcher is prefix-based and should be reviewed whenever route topology changes.

## Recent Cleanup Snapshot
- Release builder consolidated to `/dashboard/releases/new` with intent-based redirects.
- Legacy GitHub generation endpoints moved to `410`.
- Legacy domain/SSO settings endpoints moved to `410`.
- HTML sanitization and URL safety were tightened across generation, editor preview, publish checks, and public render.
