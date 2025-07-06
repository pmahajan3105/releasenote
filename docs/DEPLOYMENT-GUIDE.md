# 🚀 Deployment Guide (2025-07)

> **Audience**: Makers who want a **one-click** deploy of Release Notes Generator using Vercel (full-stack Next.js) and Supabase.
>
> *Time: <30 minutes if you already have the required accounts.*

---

## 🗺️  Architecture Overview

```
 ┌───────────────┐       Edge / Serverless
 │   Browser     │──────►   Next.js API routes (Vercel Functions)
 └───────────────┘       │
                         │uses
                 ┌───────▼───────┐
                 │  Supabase DB  │
                 └───────────────┘
                         │uses
                 ┌───────▼───────┐
                 │Azure OpenAI   │
                 └───────────────┘
                         │
                 ┌───────▼───────┐
                 │   Resend      │
                 └───────────────┘
```

* **Next.js 14+** app (app router) deployed on **Vercel** – _frontend **and** backend in one place_.
* **Supabase** – Postgres + Auth (no separate Railway service).
* **Azure OpenAI** – GPT-4o-mini for note generation.
* **Resend** – transactional email.

---

## ✅ Prerequisites

1. **Accounts (all free tiers)**
   - GitHub
   - Vercel
   - Supabase
   - Azure
   - Resend
2. **Local tooling**
   - Node 18+ & npm
   - Git
3. **Fork/clone this repo**

---

## 1️⃣ External services setup (quick recap)
*Already have these? Skip to step 2.*

| Service | What you need | Docs |
|---------|---------------|------|
| Azure OpenAI | `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT`, deployment name (e.g. `gpt-4o-mini`) | see `docs/SETUP-GUIDE.md` |
| Resend | `RESEND_API_KEY`, verified sender/domain | see `docs/SETUP-GUIDE.md` |
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`<br/>optionally `SUPABASE_SERVICE_ROLE_KEY` | https://supabase.com/docs |

---

## 2️⃣ One-click Vercel deploy

1. **Push your code to GitHub** (or fork the repo).
2. Visit **Vercel → New Project → Import Git Repository**.
3. Vercel auto-detects Next.js. Keep defaults:
   - **Build Cmd**: `next build`
   - **Output Dir**: `.vercel/output` (handled automatically)
4. **Environment variables** – add these (minimum set):
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

   # Azure OpenAI
   AZURE_OPENAI_API_KEY=your_key
   AZURE_OPENAI_ENDPOINT=https://<resource>.openai.azure.com/
   AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o-mini
   AZURE_OPENAI_API_VERSION=2024-06-01

   # Email
   RESEND_API_KEY=re_xxx
   RESEND_FROM_EMAIL=noreply@yourdomain.com

   # GitHub OAuth (optional for repo import)
   GITHUB_CLIENT_ID=...
   GITHUB_CLIENT_SECRET=...
   ```
5. Click **Deploy**. Vercel will build and give you a `<project>.vercel.app` URL in ~2-3 minutes.

> 🔒 **Tip:** After deploy, mark sensitive vars as "Encrypted" in Vercel.

---

## 3️⃣ Supabase database bootstrap

Supabase migrations live in `/supabase/migrations`. They are automatically applied when you create your Supabase project via the **SQL Editor → "Upload file" → select each .sql in order** or by using the Supabase CLI:

```bash
# Install CLI
npm i -g supabase

# From project root
supabase db push --project-ref <project-ref>
```

That's it – no manual table creation required.

---

## 4️⃣ Local development (optional)

```bash
# Install deps
npm install

# Copy env sample
cp .env.example .env.local # then fill in the vars above

# Run dev server
npm run dev
```
View app at http://localhost:3000. API routes are available under http://localhost:3000/api/*.

---

## 5️⃣ Smoke test 🧪

1. Visit `/api/health` – should return `{ status:"ok" }`.
2. Sign-up/login – Supabase Auth magic link should work.
3. Generate a release note via dashboard → "Create → AI → Quick Generate".
4. Publish: verify email notification arrives (Resend).

---

## 6️⃣ Troubleshooting

| Symptom | Checklist |
|---------|-----------|
| `401 Unauthorized` from Supabase | • `NEXT_PUBLIC_SUPABASE_ANON_KEY` correct?<br/>• Row-level security off or policies set? |
| `OpenAI 429` | Rate-limit hit – lower frequency or raise quota in Azure portal. |
| Emails not sending | • Domain verified in Resend?<br/>• `RESEND_FROM_EMAIL` uses that domain? |
| Vercel build fails | Run `npm run build` locally; look for TypeScript errors. |

For more, see the **Troubleshooting** section in `docs/SETUP-GUIDE.md`.

---

## 7️⃣ Maintenance 🛠️

- **Weekly**: Check Vercel/Supabase dashboards for errors & quotas.
- **Monthly**: Update npm deps (`pnpm up -L` or `npm audit fix`).
- **Quarterly**: Rotate API keys & secrets.

---

## 🎉 Done

Share your Vercel URL and start shipping beautiful, AI-generated release notes!