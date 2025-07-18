-- Enhanced release notes versioning and workflow support
-- This adds comprehensive version control and publishing workflow features

-- Rename org_id to organization_id for consistency across all tables (if it exists)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'release_notes' 
        AND column_name = 'org_id'
    ) THEN
        ALTER TABLE release_notes RENAME COLUMN org_id TO organization_id;
    END IF;
END $$;

-- Add version control and publishing workflow fields
ALTER TABLE release_notes ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE organization_members ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE release_notes ADD COLUMN IF NOT EXISTS version_number TEXT;
ALTER TABLE release_notes ADD COLUMN IF NOT EXISTS is_major_version BOOLEAN DEFAULT false;
ALTER TABLE release_notes ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE release_notes ADD COLUMN IF NOT EXISTS published_by UUID REFERENCES auth.users(id);
ALTER TABLE release_notes ADD COLUMN IF NOT EXISTS content_json JSONB; -- Store editor state
ALTER TABLE release_notes ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE release_notes ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE release_notes ADD COLUMN IF NOT EXISTS meta_image_url TEXT;
ALTER TABLE release_notes ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE release_notes ADD COLUMN IF NOT EXISTS changelog JSONB[]; -- Track content changes

-- Create release_note_versions table for version history
CREATE TABLE IF NOT EXISTS release_note_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  release_note_id UUID NOT NULL REFERENCES release_notes(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  content_markdown TEXT,
  content_html TEXT,
  content_json JSONB,
  created_by UUID REFERENCES auth.users(id),
  change_summary TEXT,
  is_auto_save BOOLEAN DEFAULT false,
  UNIQUE(release_note_id, version_number)
);

-- Create release_note_publishing_history table
CREATE TABLE IF NOT EXISTS release_note_publishing_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  release_note_id UUID NOT NULL REFERENCES release_notes(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('draft_saved', 'scheduled', 'published', 'unpublished', 'archived')),
  performed_by UUID REFERENCES auth.users(id),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  metadata JSONB
);

-- Create release_note_collaborators table for team editing
CREATE TABLE IF NOT EXISTS release_note_collaborators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  release_note_id UUID NOT NULL REFERENCES release_notes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('editor', 'reviewer', 'viewer')) DEFAULT 'editor',
  added_by UUID REFERENCES auth.users(id),
  UNIQUE(release_note_id, user_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS release_note_versions_release_note_id_idx ON release_note_versions(release_note_id);
CREATE INDEX IF NOT EXISTS release_note_versions_version_number_idx ON release_note_versions(release_note_id, version_number);
CREATE INDEX IF NOT EXISTS release_note_publishing_history_release_note_id_idx ON release_note_publishing_history(release_note_id);
CREATE INDEX IF NOT EXISTS release_note_publishing_history_action_idx ON release_note_publishing_history(action);
CREATE INDEX IF NOT EXISTS release_note_collaborators_release_note_id_idx ON release_note_collaborators(release_note_id);
CREATE INDEX IF NOT EXISTS release_note_collaborators_user_id_idx ON release_note_collaborators(user_id);

-- Add indexes for new release_notes fields
CREATE INDEX IF NOT EXISTS release_notes_version_number_idx ON release_notes(organization_id, version_number);
CREATE INDEX IF NOT EXISTS release_notes_scheduled_at_idx ON release_notes(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS release_notes_tags_idx ON release_notes USING GIN(tags);

-- Enable RLS for new tables (policies will be added after organization_members table exists)
ALTER TABLE release_note_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE release_note_publishing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE release_note_collaborators ENABLE ROW LEVEL SECURITY;

-- Function to create new version automatically
CREATE OR REPLACE FUNCTION create_release_note_version(
  p_release_note_id UUID,
  p_title TEXT,
  p_content TEXT DEFAULT NULL,
  p_content_markdown TEXT DEFAULT NULL,
  p_content_html TEXT DEFAULT NULL,
  p_content_json JSONB DEFAULT NULL,
  p_change_summary TEXT DEFAULT NULL,
  p_is_auto_save BOOLEAN DEFAULT false
)
RETURNS UUID AS $$
DECLARE
  v_version_number INTEGER;
  v_version_id UUID;
BEGIN
  -- Get next version number
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO v_version_number
  FROM release_note_versions
  WHERE release_note_id = p_release_note_id;

  -- Insert new version
  INSERT INTO release_note_versions (
    release_note_id,
    version_number,
    title,
    content,
    content_markdown,
    content_html,
    content_json,
    created_by,
    change_summary,
    is_auto_save
  ) VALUES (
    p_release_note_id,
    v_version_number,
    p_title,
    p_content,
    p_content_markdown,
    p_content_html,
    p_content_json,
    auth.uid(),
    p_change_summary,
    p_is_auto_save
  ) RETURNING id INTO v_version_id;

  RETURN v_version_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log publishing actions
CREATE OR REPLACE FUNCTION log_publishing_action(
  p_release_note_id UUID,
  p_action TEXT,
  p_scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_history_id UUID;
BEGIN
  INSERT INTO release_note_publishing_history (
    release_note_id,
    action,
    performed_by,
    scheduled_for,
    notes,
    metadata
  ) VALUES (
    p_release_note_id,
    p_action,
    auth.uid(),
    p_scheduled_for,
    p_notes,
    p_metadata
  ) RETURNING id INTO v_history_id;

  RETURN v_history_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-save release note versions
CREATE OR REPLACE FUNCTION auto_save_release_note()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create version if content actually changed
  IF (TG_OP = 'UPDATE' AND (
    OLD.title IS DISTINCT FROM NEW.title OR
    OLD.content IS DISTINCT FROM NEW.content OR
    OLD.content_markdown IS DISTINCT FROM NEW.content_markdown OR
    OLD.content_html IS DISTINCT FROM NEW.content_html OR
    OLD.content_json IS DISTINCT FROM NEW.content_json
  )) THEN
    -- Create auto-save version
    PERFORM create_release_note_version(
      NEW.id,
      NEW.title,
      NEW.content,
      NEW.content_markdown,
      NEW.content_html,
      NEW.content_json,
      'Auto-save',
      true
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-versioning
DROP TRIGGER IF EXISTS release_note_auto_version ON release_notes;
CREATE TRIGGER release_note_auto_version
  AFTER UPDATE ON release_notes
  FOR EACH ROW
  EXECUTE FUNCTION auto_save_release_note();

-- Function to clean up old auto-save versions (keep last 10)
CREATE OR REPLACE FUNCTION cleanup_old_auto_saves()
RETURNS void AS $$
BEGIN
  WITH ranked_versions AS (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY release_note_id ORDER BY created_at DESC) as rn
    FROM release_note_versions
    WHERE is_auto_save = true
  )
  DELETE FROM release_note_versions
  WHERE id IN (
    SELECT id FROM ranked_versions WHERE rn > 10
  );
END;
$$ LANGUAGE plpgsql;

-- Update the status check constraint to include 'archived'
ALTER TABLE release_notes DROP CONSTRAINT IF EXISTS release_notes_status_check;
ALTER TABLE release_notes ADD CONSTRAINT release_notes_status_check 
  CHECK (status IN ('draft', 'published', 'scheduled', 'archived'));

-- Add some useful views
DROP VIEW IF EXISTS release_notes_with_stats;
CREATE OR REPLACE VIEW release_notes_with_stats AS
SELECT 
  rn.*,
  rv.latest_version,
  rv.total_versions,
  rph.last_published_at,
  rph.last_action,
  COALESCE(rc.collaborator_count, 0) as collaborator_count
FROM release_notes rn
LEFT JOIN (
  SELECT 
    release_note_id,
    MAX(version_number) as latest_version,
    COUNT(*) as total_versions
  FROM release_note_versions
  GROUP BY release_note_id
) rv ON rv.release_note_id = rn.id
LEFT JOIN (
  SELECT 
    release_note_id,
    MAX(created_at) FILTER (WHERE action = 'published') as last_published_at,
    (array_agg(action ORDER BY created_at DESC))[1] as last_action
  FROM release_note_publishing_history
  GROUP BY release_note_id
) rph ON rph.release_note_id = rn.id
LEFT JOIN (
  SELECT 
    release_note_id,
    COUNT(*) as collaborator_count
  FROM release_note_collaborators
  GROUP BY release_note_id
) rc ON rc.release_note_id = rn.id;