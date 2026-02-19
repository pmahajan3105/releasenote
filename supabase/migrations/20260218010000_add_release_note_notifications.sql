-- Per-subscriber notification log for idempotent release note emails.

CREATE TABLE IF NOT EXISTS release_note_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  release_note_id UUID NOT NULL REFERENCES release_notes(id) ON DELETE CASCADE,
  subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  error TEXT
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'release_note_notifications_status_check'
  ) THEN
    ALTER TABLE release_note_notifications
      ADD CONSTRAINT release_note_notifications_status_check
      CHECK (status IN ('pending', 'sent', 'failed'));
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS release_note_notifications_note_subscriber_uidx
  ON release_note_notifications (release_note_id, subscriber_id);

CREATE INDEX IF NOT EXISTS release_note_notifications_note_status_idx
  ON release_note_notifications (release_note_id, status);

-- RLS: only org members can read/write notifications for notes in their org.
ALTER TABLE release_note_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can access notifications for their organization" ON release_note_notifications;
CREATE POLICY "Users can access notifications for their organization" ON release_note_notifications
  FOR ALL
  USING (
    release_note_id IN (
      SELECT rn.id
      FROM release_notes rn
      JOIN organization_members om ON rn.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- Keep updated_at current on updates.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'update_release_note_notifications_updated_at'
  ) THEN
    CREATE TRIGGER update_release_note_notifications_updated_at
    BEFORE UPDATE ON release_note_notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

