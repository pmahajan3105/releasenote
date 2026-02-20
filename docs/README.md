# Documentation Index

This folder is intentionally split into:
- **Canonical docs**: active source of truth.
- **Archived docs**: historical context, not authoritative for implementation decisions.

## Canonical docs
- [`IMPLEMENTATION-AS-BUILT.md`](./IMPLEMENTATION-AS-BUILT.md)
  - Full as-built product and engineering reference.
  - Includes user journeys, route/API inventory, security posture, and current gaps.
- [`SETUP-GUIDE.md`](./SETUP-GUIDE.md)
  - Local development setup and required environment variables.
  - Primary AI path is OpenAI (`gpt-5.2`), Azure OpenAI is optional fallback.
- [`DEPLOYMENT-GUIDE.md`](./DEPLOYMENT-GUIDE.md)
  - Production deployment and environment/ops checklist.

## Archived docs
- Historical PRDs, plans, and pre-consolidation guides live under [`archive/`](./archive/).
- Archived docs are retained for context only and may contain stale architecture references.

## Which doc to update
- **Product flow/routes/APIs/security behavior changed**:
  - Update `IMPLEMENTATION-AS-BUILT.md`.
- **Local setup steps, dev prerequisites, env vars changed**:
  - Update `SETUP-GUIDE.md`.
- **Hosting/deployment/runtime behavior changed**:
  - Update `DEPLOYMENT-GUIDE.md`.

## Freshness policy
- Every material platform change should update canonical docs in the same PR.
- Any doc not touched for >60 days should be reviewed for drift.
- If a doc references removed routes/endpoints or old stack versions, mark and move it to `archive/`.

## Ownership model
- **Engineering** owns technical correctness (routes, APIs, runtime/security behavior).
- **Product + Engineering** co-own journey language and scope descriptions.
