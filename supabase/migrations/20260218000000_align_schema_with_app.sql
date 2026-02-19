-- Align schema with current app expectations and the "solo SaaS" roadmap.
-- This migration is intentionally additive/idempotent to support existing installs.

-- ============================================================================
-- Organizations: add basic marketing/billing fields used by the app.
-- ============================================================================

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';

-- ============================================================================
-- Organization members: add invite/join metadata (used by auth helpers).
-- ============================================================================

ALTER TABLE organization_members
  ADD COLUMN IF NOT EXISTS invited_by UUID,
  ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ;

-- ============================================================================
-- Integrations: standardize on a secure credential storage model.
-- - encrypted_credentials stores provider tokens and secrets (AES-GCM at app layer)
-- - external_id stores the provider account id (viewer id, github user id, etc.)
-- - one integration per provider per org for MVP (unique(org, type))
-- ============================================================================

ALTER TABLE integrations
  ADD COLUMN IF NOT EXISTS external_id TEXT,
  ADD COLUMN IF NOT EXISTS encrypted_credentials JSONB,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS last_sync TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Ensure config always exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'integrations' AND column_name = 'config'
  ) THEN
    -- Set default only if not already set
    ALTER TABLE integrations ALTER COLUMN config SET DEFAULT '{}'::jsonb;
  ELSE
    ALTER TABLE integrations ADD COLUMN config JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Ensure there is a unique constraint usable by "upsert onConflict: organization_id,type".
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'integrations'
      AND indexname = 'integrations_organization_id_type_unique_idx'
  ) THEN
    CREATE UNIQUE INDEX integrations_organization_id_type_unique_idx
      ON integrations (organization_id, type);
  END IF;
END $$;

-- ============================================================================
-- Ticket cache: unify to an app-friendly schema used by integration routes.
-- Supports both legacy schemas (integration_id/external_ticket_id) and newer
-- schemas (organization_id/integration_type/ticket_id[/ticket_data]).
-- ============================================================================

ALTER TABLE ticket_cache
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS organization_id UUID,
  ADD COLUMN IF NOT EXISTS integration_type TEXT,
  ADD COLUMN IF NOT EXISTS ticket_id TEXT,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT,
  ADD COLUMN IF NOT EXISTS assignee TEXT,
  ADD COLUMN IF NOT EXISTS url TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS cached_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

-- Backfill organization_id/integration_type from legacy integration_id if present.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ticket_cache' AND column_name = 'integration_id'
  ) THEN
    UPDATE ticket_cache tc
    SET
      organization_id = COALESCE(tc.organization_id, i.organization_id),
      integration_type = COALESCE(tc.integration_type, i.type)
    FROM integrations i
    WHERE tc.integration_id = i.id
      AND (tc.organization_id IS NULL OR tc.integration_type IS NULL);
  END IF;
END $$;

-- Backfill ticket_id from legacy external_ticket_id if present.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ticket_cache' AND column_name = 'external_ticket_id'
  ) THEN
    UPDATE ticket_cache
    SET ticket_id = COALESCE(ticket_id, external_ticket_id)
    WHERE ticket_id IS NULL;
  END IF;
END $$;

-- Backfill metadata from ticket_data if present (newer schema variant).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ticket_cache' AND column_name = 'ticket_data'
  ) THEN
    UPDATE ticket_cache
    SET metadata = COALESCE(NULLIF(metadata, '{}'::jsonb), ticket_data)
    WHERE ticket_data IS NOT NULL;
  END IF;
END $$;

-- Unique constraint for cache upserts used by the app.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'ticket_cache'
      AND indexname = 'ticket_cache_org_type_ticket_unique_idx'
  ) THEN
    CREATE UNIQUE INDEX ticket_cache_org_type_ticket_unique_idx
      ON ticket_cache (organization_id, integration_type, ticket_id);
  END IF;
END $$;

-- RLS for ticket_cache (safe even if already enabled/present).
ALTER TABLE ticket_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access ticket cache for their organization" ON ticket_cache;
CREATE POLICY "Users can access ticket cache for their organization" ON ticket_cache
  FOR ALL
  USING (
    organization_id IN (
      SELECT om.organization_id
      FROM organization_members om
      WHERE om.user_id = auth.uid()
    )
  );

-- ============================================================================
-- Release notes: add missing fields needed by the public portal and editor.
-- ============================================================================

ALTER TABLE release_notes
  ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS content_json JSONB,
  ADD COLUMN IF NOT EXISTS featured_image_url TEXT;

-- Allow non-markdown canonical storage (TipTap JSON) by relaxing NOT NULL.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'release_notes' AND column_name = 'content_markdown'
  ) THEN
    ALTER TABLE release_notes ALTER COLUMN content_markdown DROP NOT NULL;
  END IF;
END $$;
