# Implementation & User Journey (As-Built)

_Generated: 2026-02-18 04:12 UTC_

## 1) Purpose and Audience
This document is the canonical as-built implementation reference for Engineering + Product. It describes what is currently in production code, how user journeys map to routes/APIs/components, and where known gaps or legacy paths remain.

Canonical terminology used throughout: **Release Note**, **Organization**, **Integration**, **Published Note**, **Public Notes**.

### Assumptions and Defaults Applied
- Audience is Engineering + Product.
- Coverage is full `app/` page/API inventory as of generation time.
- Classification uses `active`, `redirect`, and `legacy` statuses.
- This is an as-built record (not an intended future architecture spec).

### Evidence Anchors Used
- `/Users/prashantmahajan/dev/Releasenote/README.md`
- `/Users/prashantmahajan/dev/Releasenote/middleware.ts`
- `/Users/prashantmahajan/dev/Releasenote/app/dashboard/releases/start/page.tsx`
- `/Users/prashantmahajan/dev/Releasenote/app/dashboard/releases/new/ai/page.tsx`
- `/Users/prashantmahajan/dev/Releasenote/app/dashboard/releases/new/template/page.tsx`
- `/Users/prashantmahajan/dev/Releasenote/app/dashboard/releases/new/scratch/page.tsx`
- `/Users/prashantmahajan/dev/Releasenote/app/dashboard/releases/edit/[id]/page.tsx`
- `/Users/prashantmahajan/dev/Releasenote/app/api/release-notes/route.ts`
- `/Users/prashantmahajan/dev/Releasenote/app/api/release-notes/[id]/route.ts`
- `/Users/prashantmahajan/dev/Releasenote/app/api/release-notes/[id]/publish/route.ts`
- `/Users/prashantmahajan/dev/Releasenote/app/api/release-notes/[id]/notify/route.ts`
- `/Users/prashantmahajan/dev/Releasenote/app/api/release-notes/generate/route.ts`
- `/Users/prashantmahajan/dev/Releasenote/app/api/auth/github/route.ts`
- `/Users/prashantmahajan/dev/Releasenote/app/api/auth/github/callback/route.ts`
- `/Users/prashantmahajan/dev/Releasenote/app/api/auth/jira/route.ts`
- `/Users/prashantmahajan/dev/Releasenote/app/api/auth/jira/callback/route.ts`
- `/Users/prashantmahajan/dev/Releasenote/app/api/auth/linear/route.ts`
- `/Users/prashantmahajan/dev/Releasenote/app/api/auth/linear/callback/route.ts`
- `/Users/prashantmahajan/dev/Releasenote/app/notes/[org_slug]/page.tsx`
- `/Users/prashantmahajan/dev/Releasenote/app/notes/[org_slug]/[release_slug]/page.tsx`
- `/Users/prashantmahajan/dev/Releasenote/components/public/enhanced-release-notes-list.tsx`
- `/Users/prashantmahajan/dev/Releasenote/app/api/v1/integrations/route.ts`
- `/Users/prashantmahajan/dev/Releasenote/app/api/v1/organizations/setup/route.ts`
- `/Users/prashantmahajan/dev/Releasenote/app/dashboard/ai-customization/page.tsx`
- `/Users/prashantmahajan/dev/Releasenote/app/dashboard/integrations/page.tsx`
- `/Users/prashantmahajan/dev/Releasenote/app/unsubscribe/page.tsx`

## 2) System at a Glance
```mermaid
flowchart LR
  A[User Browser] --> B[Next.js App Router Pages]
  B --> C[API Routes /app/api/*]
  C --> D[(Supabase: Auth + Postgres + Storage)]
  C --> E[AI Providers: Anthropic/OpenAI/Azure]
  C --> F[Integrations: GitHub/Jira/Linear APIs]
  C --> G[Email Service: Resend]
  H[Public Readers] --> I[/notes/[org_slug] + /notes/[org_slug]/[release_slug]]
  I --> C
  J[Middleware] --> B
```

High-level behavior:
- UI is primarily under `/dashboard/*`, `/integrations/*`, and public `/notes/*` pages.
- API layer in `app/api/*` handles auth, integrations, AI generation/improvement, release note CRUD/publish/notify, and org settings.
- Supabase is the central system of record for user/session, orgs, release notes, templates, integrations, and subscribers.

## 3) Primary User Journeys
### Journey 1: Sign up/login -> onboarding -> dashboard entry
- **Actor:** new or returning authenticated user
- **Entry routes:** `/signup`, `/login`, `/auth/callback`, `/onboarding`, `/dashboard`
- **Happy path:**
  1. User requests magic link on `/signup` or `/login`.
  2. Callback route exchanges auth code and checks org presence (`/auth/callback`).
  3. If org missing, user is sent to `/onboarding` to create organization + owner membership.
  4. User lands on `/dashboard` and proceeds to release operations.
- **Decision points:** existing org vs no org; callback error vs success.
- **Fallback/error states:** auth callback redirects to `/login?error=auth_failed`; onboarding form validation and insert conflict errors.
- **Code pointers:** `app/login/page.tsx`, `app/signup/page.tsx`, `app/auth/callback/route.ts`, `app/onboarding/page.tsx`, `app/dashboard/page.tsx`

### Journey 2: Connect integrations (GitHub/Jira/Linear) via OAuth
- **Actor:** authenticated author/admin
- **Entry routes:** `/integrations`, `/integrations/manage`, `/api/auth/*`
- **Happy path:**
  1. User opens integration page and clicks connect for provider.
  2. App redirects to provider OAuth (`/api/auth/github|jira|linear`).
  3. Callback exchanges code, validates state where implemented, stores tokens in `integrations` table.
  4. User returns to integration UI and can run test connection endpoints.
- **Decision points:** OAuth denied, invalid/expired state, token exchange failures, existing integration upsert.
- **Fallback/error states:** redirects with query params like `?error=...`; test APIs return connection diagnostics.
- **Code pointers:** `app/integrations/page.tsx`, `app/integrations/manage/page.tsx`, `app/api/auth/github/route.ts`, `app/api/auth/github/callback/route.ts`, `app/api/auth/jira/route.ts`, `app/api/auth/jira/callback/route.ts`, `app/api/auth/linear/route.ts`, `app/api/auth/linear/callback/route.ts`

### Journey 3: Create notes (AI/template/scratch), edit, save drafts
- **Actor:** authenticated author
- **Entry routes:** `/dashboard/releases/start`, `/dashboard/releases/new/*`, `/dashboard/releases/edit/[id]`
- **Happy path:**
  1. User selects creation mode from `/dashboard/releases/start`.
  2. AI mode pulls integration data and calls AI generation endpoints.
  3. Template/scratch modes create initial draft rows and open editor.
  4. Editor updates title/content/version/cover and persists draft via release-note APIs.
- **Decision points:** AI vs template vs scratch; integration source (GitHub/Jira); validation failures.
- **Fallback/error states:** fetch/generation errors surfaced in-page; save/update failures keep user on editor.
- **Code pointers:** `app/dashboard/releases/start/page.tsx`, `app/dashboard/releases/new/ai/page.tsx`, `app/dashboard/releases/new/template/page.tsx`, `app/dashboard/releases/new/scratch/page.tsx`, `app/dashboard/releases/edit/[id]/page.tsx`, `app/api/release-notes/route.ts`, `app/api/release-notes/[id]/route.ts`, `app/api/ai/generate/route.ts`

### Journey 4: Publish note and trigger notifications
- **Actor:** authenticated author/admin
- **Entry routes:** release list/editor actions -> publish endpoint -> notify endpoint
- **Happy path:**
  1. User publishes a draft (`/api/release-notes/[id]/publish`).
  2. Status changes to `published`, `published_at` is set.
  3. User or flow calls notify endpoint (`/api/release-notes/[id]/notify`).
  4. Active subscribers are loaded and emails are sent via Resend abstraction.
- **Decision points:** already-published guard, no subscribers guard, email provider partial failures.
- **Fallback/error states:** API returns explicit error codes/messages; notification response includes sent/failed counts.
- **Code pointers:** `components/release-notes/PublishButton.tsx`, `app/api/release-notes/[id]/publish/route.ts`, `app/api/release-notes/[id]/notify/route.ts`, `app/api/subscribers/route.ts`

### Journey 5: Public consumer view and browse notes
- **Actor:** public reader
- **Entry routes:** `/notes/[org_slug]`, `/notes/[org_slug]/[release_slug]`
- **Happy path:**
  1. Reader visits organization notes index page and filters/searches release notes.
  2. Reader opens a published note detail page by slug.
  3. Server components fetch published content + organization branding; content is sanitized before render.
  4. Metadata/OG tags are generated for SEO and social preview.
- **Decision points:** org/slug not found, unpublished notes, cache hit/miss for detail content.
- **Fallback/error states:** `notFound()` for missing/unpublished notes; cache failures fall back to DB fetch.
- **Code pointers:** `app/notes/[org_slug]/page.tsx`, `app/notes/[org_slug]/[release_slug]/page.tsx`, `components/public/enhanced-release-notes-list.tsx`

## 4) Route and API Inventory
Inventory scope captured from `app/`: **35 page routes** and **58 API routes**.

### Page Routes
| Route | File | Purpose | Auth Requirement | Primary Consumers | Status |
|---|---|---|---|---|---|
| `/ai-context` | `app/ai-context/page.tsx` | Top-level compatibility redirect into dashboard namespace. | middleware-protected prefix (redirect alias) | authenticated authors/admins | redirect |
| `/configuration` | `app/configuration/page.tsx` | Top-level compatibility redirect into dashboard namespace. | middleware-protected prefix (redirect alias) | authenticated authors/admins | redirect |
| `/dashboard/ai-context` | `app/dashboard/ai-context/page.tsx` | Organization AI context configuration UI. | authenticated app surface (dashboard shell) | authenticated authors/admins | active |
| `/dashboard/ai-customization` | `app/dashboard/ai-customization/page.tsx` | Dashboard subpage for authenticated release operations. | authenticated app surface (dashboard shell) | authenticated authors/admins | redirect |
| `/dashboard/configuration` | `app/dashboard/configuration/page.tsx` | Organization configuration workspace. | authenticated app surface (dashboard shell) | authenticated authors/admins | active |
| `/dashboard/integrations` | `app/dashboard/integrations/page.tsx` | Dashboard subpage for authenticated release operations. | authenticated app surface (dashboard shell) | authenticated authors/admins | redirect |
| `/dashboard` | `app/dashboard/page.tsx` | Authenticated dashboard home and quick actions. | authenticated app surface (dashboard shell) | application users | active |
| `/dashboard/releases/edit/[id]` | `app/dashboard/releases/edit/[id]/page.tsx` | Edit existing release note, preview, upload cover, save/publish. | authenticated app surface (dashboard shell) | authenticated authors/admins | active |
| `/dashboard/releases/new/ai` | `app/dashboard/releases/new/ai/page.tsx` | AI-driven release note creation (GitHub/Jira tabs). | authenticated app surface (dashboard shell) | authenticated authors/admins | active |
| `/dashboard/releases/new/scratch` | `app/dashboard/releases/new/scratch/page.tsx` | Create blank draft and open editor. | authenticated app surface (dashboard shell) | authenticated authors/admins | active |
| `/dashboard/releases/new/template` | `app/dashboard/releases/new/template/page.tsx` | Create draft from template scaffold. | authenticated app surface (dashboard shell) | authenticated authors/admins | active |
| `/dashboard/releases` | `app/dashboard/releases/page.tsx` | Primary release note list, status filters, and actions. | authenticated app surface (dashboard shell) | authenticated authors/admins | active |
| `/dashboard/releases/start` | `app/dashboard/releases/start/page.tsx` | Chooser for AI/template/scratch creation paths. | authenticated app surface (dashboard shell) | authenticated authors/admins | active |
| `/dashboard/settings` | `app/dashboard/settings/page.tsx` | Settings shell (profile/org settings component). | authenticated app surface (dashboard shell) | authenticated authors/admins | active |
| `/dashboard/templates` | `app/dashboard/templates/page.tsx` | Template CRUD/import/export UI. | authenticated app surface (dashboard shell) | authenticated authors/admins | active |
| `/integrations/manage` | `app/integrations/manage/page.tsx` | Detailed integration management tabs and selectors. | middleware-protected prefix | authenticated authors/admins | active |
| `/integrations/new` | `app/integrations/new/page.tsx` | Legacy/new integration onboarding page (GitHub-first flow). | middleware-protected prefix | authenticated authors/admins | active |
| `/integrations` | `app/integrations/page.tsx` | Integration catalog, connection status, tests, disconnect actions. | middleware-protected prefix | authenticated authors/admins | active |
| `/login` | `app/login/page.tsx` | Magic-link sign-in UX. | public | existing users | active |
| `/notes/[org_slug]/[release_slug]` | `app/notes/[org_slug]/[release_slug]/page.tsx` | Public release note detail page (SEO + caching). | public | public readers | active |
| `/notes/[org_slug]` | `app/notes/[org_slug]/page.tsx` | Public organization release note index with search/filter. | public | public readers | active |
| `/onboarding` | `app/onboarding/page.tsx` | Creates organization and owner membership after auth. | session-required (page logic) | newly authenticated users | active |
| `/` | `app/page.tsx` | Landing page with entry links to auth, dashboard, and docs. | public | prospective users | active |
| `/release-notes/create` | `app/release-notes/create/page.tsx` | Legacy create flow with rich text editor + AI helpers. | middleware-protected prefix | authenticated authors/admins | active |
| `/release-notes/published` | `app/release-notes/published/page.tsx` | Legacy published notes list, filter, and quick actions. | middleware-protected prefix | authenticated authors/admins | active |
| `/releases/new/ai` | `app/releases/new/ai/page.tsx` | Compatibility redirect into dashboard release routes. | middleware-protected prefix | authenticated authors/admins | redirect |
| `/releases/new` | `app/releases/new/page.tsx` | Compatibility redirect into dashboard release routes. | middleware-protected prefix | authenticated authors/admins | redirect |
| `/releases/new/scratch` | `app/releases/new/scratch/page.tsx` | Compatibility redirect into dashboard release routes. | middleware-protected prefix | authenticated authors/admins | redirect |
| `/releases/new/template` | `app/releases/new/template/page.tsx` | Compatibility redirect into dashboard release routes. | middleware-protected prefix | authenticated authors/admins | redirect |
| `/releases` | `app/releases/page.tsx` | Compatibility redirect into dashboard release routes. | middleware-protected prefix | authenticated authors/admins | redirect |
| `/settings/ai-customization` | `app/settings/ai-customization/page.tsx` | Settings surface or redirect alias. | middleware-protected prefix | authenticated authors/admins | active |
| `/settings` | `app/settings/page.tsx` | Settings surface or redirect alias. | middleware-protected prefix | authenticated authors/admins | redirect |
| `/signup` | `app/signup/page.tsx` | Magic-link sign-up and initial profile capture. | public | new users | active |
| `/templates` | `app/templates/page.tsx` | Top-level compatibility redirect into dashboard namespace. | middleware-protected prefix (redirect alias) | authenticated authors/admins | redirect |
| `/unsubscribe` | `app/unsubscribe/page.tsx` | Legacy unsubscribe info/fallback page. | public | email recipients | active |

### API Routes
| Endpoint | Methods | File | Auth Mode | Primary Caller | Side Effects | Status |
|---|---|---|---|---|---|---|
| `/api/ai/analyze-content` | `POST,PATCH` | `app/api/ai/analyze-content/route.ts` | no explicit session check | AI generation/improvement UIs | writes DB and/or external side effects | active |
| `/api/ai/generate` | `POST,PATCH` | `app/api/ai/generate/route.ts` | no explicit session check | AI generation/improvement UIs | writes DB and/or external side effects | active |
| `/api/ai/generate-with-brand-voice` | `POST` | `app/api/ai/generate-with-brand-voice/route.ts` | Supabase session required | AI generation/improvement UIs | writes DB and/or external side effects | active |
| `/api/ai/generate-with-custom-prompt` | `POST` | `app/api/ai/generate-with-custom-prompt/route.ts` | Supabase session required | AI generation/improvement UIs | writes DB and/or external side effects | active |
| `/api/ai/improve-content` | `POST,PATCH` | `app/api/ai/improve-content/route.ts` | no explicit session check | AI generation/improvement UIs | writes DB and/or external side effects | active |
| `/api/ai-context` | `GET,POST` | `app/api/ai-context/route.ts` | Supabase session required | AI generation/improvement UIs | writes DB and/or external side effects | active |
| `/api/auth/github/callback` | `GET` | `app/api/auth/github/callback/route.ts` | Supabase session required | browser OAuth/auth callback flow | session/token exchange; integration persistence | active |
| `/api/auth/github` | `GET` | `app/api/auth/github/route.ts` | public OAuth initiation (integration flow) | browser OAuth/auth callback flow | redirect to provider OAuth | active |
| `/api/auth/jira/callback` | `GET` | `app/api/auth/jira/callback/route.ts` | Supabase session required | browser OAuth/auth callback flow | session/token exchange; integration persistence | active |
| `/api/auth/jira` | `GET` | `app/api/auth/jira/route.ts` | Supabase session required | browser OAuth/auth callback flow | redirect to provider OAuth | active |
| `/api/auth/linear/callback` | `GET` | `app/api/auth/linear/callback/route.ts` | Supabase session required | browser OAuth/auth callback flow | session/token exchange; integration persistence | active |
| `/api/auth/linear` | `GET` | `app/api/auth/linear/route.ts` | Supabase session required | browser OAuth/auth callback flow | redirect to provider OAuth | active |
| `/api/brand-voices/[id]` | `GET,PUT,DELETE` | `app/api/brand-voices/[id]/route.ts` | Supabase session required | AI customization UI | writes DB and/or external side effects | active |
| `/api/brand-voices` | `GET,POST` | `app/api/brand-voices/route.ts` | Supabase session required | AI customization UI | writes DB and/or external side effects | active |
| `/api/categories` | `GET,POST` | `app/api/categories/route.ts` | Supabase session required | application clients | writes DB and/or external side effects | active |
| `/api/cron/ssl-renewal` | `POST,GET` | `app/api/cron/ssl-renewal/route.ts` | cron bearer secret (`CRON_SECRET`) | ops/integration validation | writes DB and/or external side effects | active |
| `/api/csrf-token` | `GET` | `app/api/csrf-token/route.ts` | Supabase session required | application clients | read-only/lookup | active |
| `/api/custom-prompts` | `GET,POST` | `app/api/custom-prompts/route.ts` | Supabase session required | AI customization UI | writes DB and/or external side effects | active |
| `/api/domain-lookup` | `GET` | `app/api/domain-lookup/route.ts` | route handler client, auth behavior in-handler | organization/domain settings surfaces | read-only/lookup | active |
| `/api/domain-settings` | `GET,PUT` | `app/api/domain-settings/route.ts` | no session check (userId param) | organization/domain settings surfaces | writes DB and/or external side effects | active |
| `/api/github/generate-release-notes` | `POST` | `app/api/github/generate-release-notes/route.ts` | Supabase session required | GitHub generation helper flows | writes DB and/or external side effects | active |
| `/api/github/repositories` | `GET` | `app/api/github/repositories/route.ts` | Supabase session required | GitHub generation helper flows | read-only/lookup | active |
| `/api/health` | `GET` | `app/api/health/route.ts` | public/internal utility (no explicit session) | ops/integration validation | read-only/lookup | active |
| `/api/integrations/github/health` | `POST` | `app/api/integrations/github/health/route.ts` | Supabase session required | integration management UIs (`/integrations`, `/integrations/manage`) | writes DB and/or external side effects | active |
| `/api/integrations/github/repositories/[owner]/[repo]/commits` | `GET` | `app/api/integrations/github/repositories/[owner]/[repo]/commits/route.ts` | Supabase session required | integration management UIs (`/integrations`, `/integrations/manage`) | read-only/lookup | active |
| `/api/integrations/github/repositories/[owner]/[repo]/pulls` | `GET` | `app/api/integrations/github/repositories/[owner]/[repo]/pulls/route.ts` | Supabase session required | integration management UIs (`/integrations`, `/integrations/manage`) | read-only/lookup | active |
| `/api/integrations/github/repositories` | `GET` | `app/api/integrations/github/repositories/route.ts` | Supabase session required | integration management UIs (`/integrations`, `/integrations/manage`) | read-only/lookup | active |
| `/api/integrations/github/test-connection` | `POST` | `app/api/integrations/github/test-connection/route.ts` | Supabase session required | integration management UIs (`/integrations`, `/integrations/manage`) | writes DB and/or external side effects | active |
| `/api/integrations/jira/issues` | `GET` | `app/api/integrations/jira/issues/route.ts` | Supabase session required | integration management UIs (`/integrations`, `/integrations/manage`) | read-only/lookup | active |
| `/api/integrations/jira/projects` | `GET` | `app/api/integrations/jira/projects/route.ts` | Supabase session required | integration management UIs (`/integrations`, `/integrations/manage`) | read-only/lookup | active |
| `/api/integrations/jira/test-connection` | `POST` | `app/api/integrations/jira/test-connection/route.ts` | Supabase session required | integration management UIs (`/integrations`, `/integrations/manage`) | writes DB and/or external side effects | active |
| `/api/integrations/linear/issues` | `GET` | `app/api/integrations/linear/issues/route.ts` | Supabase session required | integration management UIs (`/integrations`, `/integrations/manage`) | read-only/lookup | active |
| `/api/integrations/linear/teams` | `GET` | `app/api/integrations/linear/teams/route.ts` | Supabase session required | integration management UIs (`/integrations`, `/integrations/manage`) | read-only/lookup | active |
| `/api/integrations/linear/test-connection` | `POST` | `app/api/integrations/linear/test-connection/route.ts` | Supabase session required | integration management UIs (`/integrations`, `/integrations/manage`) | writes DB and/or external side effects | active |
| `/api/organizations/[id]/custom-css` | `GET,PUT,DELETE` | `app/api/organizations/[id]/custom-css/route.ts` | Supabase session required | organization/domain settings surfaces | writes DB and/or external side effects | active |
| `/api/organizations/[id]/domain` | `PUT,DELETE` | `app/api/organizations/[id]/domain/route.ts` | Supabase session required | organization/domain settings surfaces | writes DB and/or external side effects | active |
| `/api/organizations/[id]/domain/verify` | `POST` | `app/api/organizations/[id]/domain/verify/route.ts` | Supabase session required | organization/domain settings surfaces | writes DB and/or external side effects | active |
| `/api/organizations/[id]/meta` | `GET,PUT` | `app/api/organizations/[id]/meta/route.ts` | Supabase session required | organization/domain settings surfaces | writes DB and/or external side effects | active |
| `/api/organizations/[id]/settings` | `GET,PUT` | `app/api/organizations/[id]/settings/route.ts` | Supabase session required | organization/domain settings surfaces | writes DB and/or external side effects | active |
| `/api/organizations/[id]/ssl` | `GET,POST,DELETE` | `app/api/organizations/[id]/ssl/route.ts` | Supabase session required | organization/domain settings surfaces | writes DB and/or external side effects | active |
| `/api/organizations/[id]/upload-logo` | `POST` | `app/api/organizations/[id]/upload-logo/route.ts` | route handler client, auth behavior in-handler | organization/domain settings surfaces | writes DB and/or external side effects | active |
| `/api/release-notes/[id]/notify` | `POST` | `app/api/release-notes/[id]/notify/route.ts` | Supabase session required | release authoring/editor UIs | writes DB and/or external side effects | active |
| `/api/release-notes/[id]/publish` | `POST` | `app/api/release-notes/[id]/publish/route.ts` | Supabase session required | release authoring/editor UIs | writes DB and/or external side effects | active |
| `/api/release-notes/[id]` | `GET,PUT,DELETE` | `app/api/release-notes/[id]/route.ts` | Supabase session required | release authoring/editor UIs | writes DB and/or external side effects | active |
| `/api/release-notes/generate` | `POST` | `app/api/release-notes/generate/route.ts` | Supabase session required | release authoring/editor UIs | writes DB and/or external side effects | active |
| `/api/release-notes/init` | `GET` | `app/api/release-notes/init/route.ts` | org-scoped session wrapper (`withOrgAuth`) | release authoring/editor UIs | read-only/lookup | active |
| `/api/release-notes` | `GET,POST` | `app/api/release-notes/route.ts` | org-scoped session wrapper (`withOrgAuth`) | release authoring/editor UIs | writes DB and/or external side effects | active |
| `/api/sso-settings` | `GET,PUT` | `app/api/sso-settings/route.ts` | no session check (userId param) | organization/domain settings surfaces | writes DB and/or external side effects | active |
| `/api/subscribers` | `POST,GET` | `app/api/subscribers/route.ts` | Supabase session required | public note pages + publish notifications | writes DB and/or external side effects | active |
| `/api/subscribers/unsubscribe` | `POST` | `app/api/subscribers/unsubscribe/route.ts` | route handler client, auth behavior in-handler | public note pages + publish notifications | writes DB and/or external side effects | active |
| `/api/templates/[id]` | `PUT,DELETE` | `app/api/templates/[id]/route.ts` | Supabase session required | template management UI | writes DB and/or external side effects | active |
| `/api/templates` | `GET,POST` | `app/api/templates/route.ts` | Supabase session required | template management UI | writes DB and/or external side effects | active |
| `/api/test-email` | `GET,POST` | `app/api/test-email/route.ts` | public/internal utility (no explicit session) | ops/integration validation | writes DB and/or external side effects | active |
| `/api/v1/integrations` | `GET` | `app/api/v1/integrations/route.ts` | legacy public shim | legacy clients | read-only/lookup | legacy (410 removed) |
| `/api/v1/organizations/setup` | `POST` | `app/api/v1/organizations/setup/route.ts` | legacy public shim | legacy clients | writes DB and/or external side effects | legacy (410 removed) |
| `/api/v1/release-notes/generate` | `POST` | `app/api/v1/release-notes/generate/route.ts` | Supabase session required | legacy/compat API clients | writes DB and/or external side effects | active (v1 compatibility) |
| `/api/v1/release-notes/save` | `POST` | `app/api/v1/release-notes/save/route.ts` | Supabase session required | legacy/compat API clients | writes DB and/or external side effects | active (v1 compatibility) |
| `/auth/callback` | `GET` | `app/auth/callback/route.ts` | auth code exchange route (no pre-session) | browser OAuth/auth callback flow | session/token exchange; integration persistence | active |

## 5) Integration Flows (GitHub / Jira / Linear)
### GitHub
- OAuth initiation: `/api/auth/github` -> provider authorize URL.
- OAuth callback: `/api/auth/github/callback` exchanges code, fetches GitHub user, persists integration token metadata.
- Operational endpoints: repository list/health/test, and repo commits/pulls under `/api/integrations/github/*`.
- UI surfaces: `/integrations`, `/integrations/manage`, plus GitHub generation helper routes.

### Jira
- OAuth initiation with state storage in `oauth_states`: `/api/auth/jira`.
- Callback validates state + expiry, exchanges token, fetches accessible resources, upserts integration: `/api/auth/jira/callback`.
- Data endpoints: `/api/integrations/jira/projects`, `/api/integrations/jira/issues`, `/api/integrations/jira/test-connection`.
- Used by AI creation flow for ticket selection and release-note generation context.

### Linear
- OAuth initiation with state persistence: `/api/auth/linear`.
- Callback validates state, exchanges token, loads viewer/org GraphQL data, upserts integration: `/api/auth/linear/callback`.
- Data endpoints: `/api/integrations/linear/teams`, `/api/integrations/linear/issues`, `/api/integrations/linear/test-connection`.

### Integration Cache/Normalization Pattern
- Ticket fetch flows (especially v1 generate path) attempt `ticket_cache` read-through behavior and fallback to provider APIs when cache misses occur.
- Current implementation mixes provider-specific token/config assumptions across old/new routes; see risks section.

## 6) AI Generation and Content Authoring Flows
- Core generation endpoint: `/api/ai/generate` (POST for generation, PATCH for improvement).
- Additional AI APIs: `/api/ai/analyze-content`, `/api/ai/improve-content`, `/api/ai/generate-with-brand-voice`, `/api/ai/generate-with-custom-prompt`.
- Legacy generation endpoint still present: `/api/release-notes/generate` and v1 API endpoints under `/api/v1/release-notes/*`.
- AI customization domain: brand voices and custom prompts via `/api/brand-voices*` and `/api/custom-prompts` with UI at `/settings/ai-customization` and `/dashboard/ai-context`.
- Sanitization: HTML output is sanitized server-side in multiple AI flows before persistence/render.

## 7) Publishing, Notifications, and Subscriber Flow
- Release note lifecycle endpoints:
  - list/create: `/api/release-notes`
  - read/update/delete: `/api/release-notes/[id]`
  - publish: `/api/release-notes/[id]/publish`
  - initialization payloads: `/api/release-notes/init`
- Notification fanout: `/api/release-notes/[id]/notify` loads active subscribers and sends email via `lib/email` abstraction.
- Subscriber management: `/api/subscribers` (GET/POST), `/api/subscribers/unsubscribe` (POST).
- Public unsubscribe fallback page exists at `/unsubscribe` (legacy message).

## 8) Public Release Notes Experience
- Index page `/notes/[org_slug]` loads org branding + latest published notes and renders enhanced list/filter UI.
- Detail page `/notes/[org_slug]/[release_slug]` fetches note with organization join, sanitizes content, and renders branded note view.
- SEO metadata generation exists on both index and detail pages (title/description/OG/Twitter).
- Caching behavior: middleware sets cache headers for `/notes/*`; detail page performs cache read/write through app cache layer before DB fallback.

## 9) Security, Auth, and Operational Controls
- Global middleware (`middleware.ts`) adds security headers and applies route-class rate limiting (auth/api/public classes).
- Middleware protected prefixes: `/releases`, `/settings`, `/integrations`, `/configuration`, `/ai-context`, `/templates` (plus `/`).
- API JSON content-type enforcement exists for mutating API requests in middleware.
- Suspicious bot user-agent blocking is applied for non-public-notes routes.
- OAuth state validation is implemented for Jira and Linear callbacks via `oauth_states` (GitHub integration flow currently uses a fixed state marker).
- Cron SSL renewal endpoint is protected with bearer secret validation.

## 10) Data Model Touchpoints (Practical)
| Table/Domain | How it is used in product flows | Key routes/components |
|---|---|---|
| `organizations` | Tenant identity, branding, settings, domain, metadata. | onboarding, org settings/domain/meta APIs, public notes pages |
| `organization_members` | Membership/role linkage and org scoping. | auth helper wrappers, release-note CRUD authorization paths |
| `release_notes` | Core authored content, status, publish timestamp, slug, views. | dashboard releases pages, `/api/release-notes*`, public note detail/index |
| `integrations` | OAuth tokens and provider metadata for GitHub/Jira/Linear. | `/api/auth/*`, `/api/integrations/*`, integration UIs |
| `oauth_states` | Temporary anti-CSRF state for OAuth flows. | Jira/Linear auth initiate + callback routes |
| `templates` | Organization-specific AI template definitions. | `/dashboard/templates`, `/api/templates*` |
| `brand_voices` | Brand tone/style configuration for generation. | `/settings/ai-customization`, `/api/brand-voices*` |
| `custom_prompts` | Structured prompt templates + variables. | AI customization UI and `/api/custom-prompts` |
| `categories` | Release note grouping metadata. | `/api/categories`, release-note init payloads |
| `subscribers` | Recipient list for publish notifications. | `/api/subscribers*`, notify flow |
| `ticket_cache` | Cached issue/ticket snapshots from integrations. | v1 generation path and Jira issue sync routines |
| Supabase Storage buckets | Cover images and organization assets (logo/favicon). | editor cover upload path, org upload-logo API |

## 11) Current Gaps, Legacy Paths, and Risks (Prioritized)
Priority rubric: **P1 = high impact/security/data integrity**, **P2 = workflow consistency/maintainability**, **P3 = quality/usability debt**.

### P1
| Priority | Symptom | Impacted Journey | Likely Root Cause | Recommended Remediation Direction |
|---|---|---|---|---|
| P1 | `api/domain-settings` and `api/sso-settings` accept `userId` and use anon client without session enforcement. | Journey 1/4 (org settings + downstream behavior) | Legacy demo-style endpoints retained in main API surface. | Require authenticated session + org membership checks, remove `userId` trust from request payload, and deprecate public variant. |
| P1 | Some organization-scoped writes use `session.user.id` as organization ID assumptions. | Journey 2/3/4 (integration save, note ownership checks) | Early single-tenant assumption persisted in some routes. | Standardize org resolution through `organization_members` and shared auth helper to prevent cross-tenant logic drift. |
| P1 | AI endpoints (`/api/ai/*` subset) are callable without explicit session checks. | Journey 3 (content generation cost path) | Split evolution between public utility and authenticated product APIs. | Decide policy: require session/API key for all costly generation routes; add rate/quotas at endpoint level. |

### P2
| Priority | Symptom | Impacted Journey | Likely Root Cause | Recommended Remediation Direction |
|---|---|---|---|---|
| P2 | Namespace drift across `/dashboard/*`, `/releases/*`, `/release-notes/*`, and top-level aliases. | Journey 3/4/5 navigation consistency | Incremental route migration with compatibility redirects. | Publish a canonical route map, collapse duplicate entry points, and remove stale aliases in phased manner. |
| P2 | API generations overlap (`/api/release-notes/generate`, `/api/ai/generate`, `/api/v1/release-notes/*`). | Journey 3 maintainability | Backward compatibility kept while new architecture landed. | Define one canonical generation contract; mark legacy endpoints with deprecation timeline and caller migration checklist. |
| P2 | OAuth handling differs by provider (GitHub fixed state marker vs state table validation in Jira/Linear). | Journey 2 security consistency | Provider integrations were implemented at different times/patterns. | Unify OAuth handshake abstraction with consistent state storage/validation and callback telemetry. |
| P2 | Middleware protected prefixes do not explicitly include `/dashboard/*` while dashboard is effectively authenticated via page logic. | Journey 1/3 consistency | Historical migration from top-level routes to dashboard namespace. | Either include `/dashboard` in middleware protections or enforce server-side guard in dashboard layout. |

### P3
| Priority | Symptom | Impacted Journey | Likely Root Cause | Recommended Remediation Direction |
|---|---|---|---|---|
| P3 | Jest test output includes recurring non-failing `act(...)` warnings from UI interaction tests. | Dev velocity / CI signal quality | Test wrappers around async UI interactions are incomplete in some suites. | Gradually wrap affected interactions in `act`/`waitFor` patterns and tighten test logging baseline. |
| P3 | Legacy pages remain for backward links (`/unsubscribe`, several redirect aliases). | Journey 5 external links and comms consistency | Compatibility preservation for old links and generated URLs. | Keep short-term, then remove once telemetry confirms no meaningful traffic. |

## 12) Known Redirects and 410 Shims
### Redirect Pages
| Route | Redirect Target | File |
|---|---|---|
| `/ai-context` | `/dashboard/ai-context` | `app/ai-context/page.tsx` |
| `/configuration` | `/dashboard/configuration` | `app/configuration/page.tsx` |
| `/dashboard/ai-customization` | `/dashboard/ai-context` | `app/dashboard/ai-customization/page.tsx` |
| `/dashboard/integrations` | `/integrations/manage` | `app/dashboard/integrations/page.tsx` |
| `/releases` | `/dashboard/releases` | `app/releases/page.tsx` |
| `/releases/new` | `/dashboard/releases/start` | `app/releases/new/page.tsx` |
| `/releases/new/ai` | `/dashboard/releases/new/ai` | `app/releases/new/ai/page.tsx` |
| `/releases/new/scratch` | `/dashboard/releases/new/scratch` | `app/releases/new/scratch/page.tsx` |
| `/releases/new/template` | `/dashboard/releases/new/template` | `app/releases/new/template/page.tsx` |
| `/settings` | `/dashboard/settings` | `app/settings/page.tsx` |
| `/templates` | `/dashboard/templates` | `app/templates/page.tsx` |

### 410 Legacy API Shims
| Endpoint | Behavior | File |
|---|---|---|
| `/api/v1/integrations` | returns HTTP 410 with migration message | `app/api/v1/integrations/route.ts` |
| `/api/v1/organizations/setup` | returns HTTP 410 with migration message | `app/api/v1/organizations/setup/route.ts` |

## 13) Testing and Reliability Posture
Latest observed validation status in this workspace:
- `npm run -s typecheck`: passing.
- `npm run -s lint`: passing (`No ESLint warnings or errors`).
- `npm run -s test:new`: passing (`27/27 suites`, `473/473 tests`).
- Known non-failing warning category remains: React testing `act(...)` warnings and intentional cache error-path logs in cache tests.

Reliability notes:
- Public notes detail route uses cache + DB fallback pattern to reduce latency.
- Middleware provides baseline security headers and route-class throttling, but endpoint-level auth consistency is still uneven (see P1/P2).

## 14) Appendix A: Page Index
- `/ai-context` -> `app/ai-context/page.tsx`
- `/configuration` -> `app/configuration/page.tsx`
- `/dashboard/ai-context` -> `app/dashboard/ai-context/page.tsx`
- `/dashboard/ai-customization` -> `app/dashboard/ai-customization/page.tsx`
- `/dashboard/configuration` -> `app/dashboard/configuration/page.tsx`
- `/dashboard/integrations` -> `app/dashboard/integrations/page.tsx`
- `/dashboard` -> `app/dashboard/page.tsx`
- `/dashboard/releases/edit/[id]` -> `app/dashboard/releases/edit/[id]/page.tsx`
- `/dashboard/releases/new/ai` -> `app/dashboard/releases/new/ai/page.tsx`
- `/dashboard/releases/new/scratch` -> `app/dashboard/releases/new/scratch/page.tsx`
- `/dashboard/releases/new/template` -> `app/dashboard/releases/new/template/page.tsx`
- `/dashboard/releases` -> `app/dashboard/releases/page.tsx`
- `/dashboard/releases/start` -> `app/dashboard/releases/start/page.tsx`
- `/dashboard/settings` -> `app/dashboard/settings/page.tsx`
- `/dashboard/templates` -> `app/dashboard/templates/page.tsx`
- `/integrations/manage` -> `app/integrations/manage/page.tsx`
- `/integrations/new` -> `app/integrations/new/page.tsx`
- `/integrations` -> `app/integrations/page.tsx`
- `/login` -> `app/login/page.tsx`
- `/notes/[org_slug]/[release_slug]` -> `app/notes/[org_slug]/[release_slug]/page.tsx`
- `/notes/[org_slug]` -> `app/notes/[org_slug]/page.tsx`
- `/onboarding` -> `app/onboarding/page.tsx`
- `/` -> `app/page.tsx`
- `/release-notes/create` -> `app/release-notes/create/page.tsx`
- `/release-notes/published` -> `app/release-notes/published/page.tsx`
- `/releases/new/ai` -> `app/releases/new/ai/page.tsx`
- `/releases/new` -> `app/releases/new/page.tsx`
- `/releases/new/scratch` -> `app/releases/new/scratch/page.tsx`
- `/releases/new/template` -> `app/releases/new/template/page.tsx`
- `/releases` -> `app/releases/page.tsx`
- `/settings/ai-customization` -> `app/settings/ai-customization/page.tsx`
- `/settings` -> `app/settings/page.tsx`
- `/signup` -> `app/signup/page.tsx`
- `/templates` -> `app/templates/page.tsx`
- `/unsubscribe` -> `app/unsubscribe/page.tsx`

## 15) Appendix B: API Endpoint Index
- `/api/ai/analyze-content` [POST,PATCH] -> `app/api/ai/analyze-content/route.ts`
- `/api/ai/generate` [POST,PATCH] -> `app/api/ai/generate/route.ts`
- `/api/ai/generate-with-brand-voice` [POST] -> `app/api/ai/generate-with-brand-voice/route.ts`
- `/api/ai/generate-with-custom-prompt` [POST] -> `app/api/ai/generate-with-custom-prompt/route.ts`
- `/api/ai/improve-content` [POST,PATCH] -> `app/api/ai/improve-content/route.ts`
- `/api/ai-context` [GET,POST] -> `app/api/ai-context/route.ts`
- `/api/auth/github/callback` [GET] -> `app/api/auth/github/callback/route.ts`
- `/api/auth/github` [GET] -> `app/api/auth/github/route.ts`
- `/api/auth/jira/callback` [GET] -> `app/api/auth/jira/callback/route.ts`
- `/api/auth/jira` [GET] -> `app/api/auth/jira/route.ts`
- `/api/auth/linear/callback` [GET] -> `app/api/auth/linear/callback/route.ts`
- `/api/auth/linear` [GET] -> `app/api/auth/linear/route.ts`
- `/api/brand-voices/[id]` [GET,PUT,DELETE] -> `app/api/brand-voices/[id]/route.ts`
- `/api/brand-voices` [GET,POST] -> `app/api/brand-voices/route.ts`
- `/api/categories` [GET,POST] -> `app/api/categories/route.ts`
- `/api/cron/ssl-renewal` [POST,GET] -> `app/api/cron/ssl-renewal/route.ts`
- `/api/csrf-token` [GET] -> `app/api/csrf-token/route.ts`
- `/api/custom-prompts` [GET,POST] -> `app/api/custom-prompts/route.ts`
- `/api/domain-lookup` [GET] -> `app/api/domain-lookup/route.ts`
- `/api/domain-settings` [GET,PUT] -> `app/api/domain-settings/route.ts`
- `/api/github/generate-release-notes` [POST] -> `app/api/github/generate-release-notes/route.ts`
- `/api/github/repositories` [GET] -> `app/api/github/repositories/route.ts`
- `/api/health` [GET] -> `app/api/health/route.ts`
- `/api/integrations/github/health` [POST] -> `app/api/integrations/github/health/route.ts`
- `/api/integrations/github/repositories/[owner]/[repo]/commits` [GET] -> `app/api/integrations/github/repositories/[owner]/[repo]/commits/route.ts`
- `/api/integrations/github/repositories/[owner]/[repo]/pulls` [GET] -> `app/api/integrations/github/repositories/[owner]/[repo]/pulls/route.ts`
- `/api/integrations/github/repositories` [GET] -> `app/api/integrations/github/repositories/route.ts`
- `/api/integrations/github/test-connection` [POST] -> `app/api/integrations/github/test-connection/route.ts`
- `/api/integrations/jira/issues` [GET] -> `app/api/integrations/jira/issues/route.ts`
- `/api/integrations/jira/projects` [GET] -> `app/api/integrations/jira/projects/route.ts`
- `/api/integrations/jira/test-connection` [POST] -> `app/api/integrations/jira/test-connection/route.ts`
- `/api/integrations/linear/issues` [GET] -> `app/api/integrations/linear/issues/route.ts`
- `/api/integrations/linear/teams` [GET] -> `app/api/integrations/linear/teams/route.ts`
- `/api/integrations/linear/test-connection` [POST] -> `app/api/integrations/linear/test-connection/route.ts`
- `/api/organizations/[id]/custom-css` [GET,PUT,DELETE] -> `app/api/organizations/[id]/custom-css/route.ts`
- `/api/organizations/[id]/domain` [PUT,DELETE] -> `app/api/organizations/[id]/domain/route.ts`
- `/api/organizations/[id]/domain/verify` [POST] -> `app/api/organizations/[id]/domain/verify/route.ts`
- `/api/organizations/[id]/meta` [GET,PUT] -> `app/api/organizations/[id]/meta/route.ts`
- `/api/organizations/[id]/settings` [GET,PUT] -> `app/api/organizations/[id]/settings/route.ts`
- `/api/organizations/[id]/ssl` [GET,POST,DELETE] -> `app/api/organizations/[id]/ssl/route.ts`
- `/api/organizations/[id]/upload-logo` [POST] -> `app/api/organizations/[id]/upload-logo/route.ts`
- `/api/release-notes/[id]/notify` [POST] -> `app/api/release-notes/[id]/notify/route.ts`
- `/api/release-notes/[id]/publish` [POST] -> `app/api/release-notes/[id]/publish/route.ts`
- `/api/release-notes/[id]` [GET,PUT,DELETE] -> `app/api/release-notes/[id]/route.ts`
- `/api/release-notes/generate` [POST] -> `app/api/release-notes/generate/route.ts`
- `/api/release-notes/init` [GET] -> `app/api/release-notes/init/route.ts`
- `/api/release-notes` [GET,POST] -> `app/api/release-notes/route.ts`
- `/api/sso-settings` [GET,PUT] -> `app/api/sso-settings/route.ts`
- `/api/subscribers` [POST,GET] -> `app/api/subscribers/route.ts`
- `/api/subscribers/unsubscribe` [POST] -> `app/api/subscribers/unsubscribe/route.ts`
- `/api/templates/[id]` [PUT,DELETE] -> `app/api/templates/[id]/route.ts`
- `/api/templates` [GET,POST] -> `app/api/templates/route.ts`
- `/api/test-email` [GET,POST] -> `app/api/test-email/route.ts`
- `/api/v1/integrations` [GET] -> `app/api/v1/integrations/route.ts`
- `/api/v1/organizations/setup` [POST] -> `app/api/v1/organizations/setup/route.ts`
- `/api/v1/release-notes/generate` [POST] -> `app/api/v1/release-notes/generate/route.ts`
- `/api/v1/release-notes/save` [POST] -> `app/api/v1/release-notes/save/route.ts`
- `/auth/callback` [GET] -> `app/auth/callback/route.ts`

## 16) Appendix C: Recent Cleanup Summary
Recent cleanup batches completed prior to this document:
- Next.js dynamic route param typing alignment and integration route typing hardening.
- Release note schema alignment and stale field removal across services/pages/routes.
- AI provider contract alignment and stronger route-level typing.
- Repo-wide lint/type debt reduction across tests, editor extensions, rate-limiter, and UI surfaces.
- Legacy route shims added for removed endpoints/pages to avoid broken references (redirects/410 responses).
- Test infra stabilized to green baseline (`typecheck`, `lint`, `test:new` pass), with known non-failing warning categories documented.
