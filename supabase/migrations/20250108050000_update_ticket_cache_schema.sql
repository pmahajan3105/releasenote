-- Update ticket_cache table to support new columns used in the v1 API
-- Add organization_id and integration_type columns if they don't exist

-- Check if columns exist and add them if they don't
DO $$ 
BEGIN
    -- Add organization_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ticket_cache' 
        AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE ticket_cache ADD COLUMN organization_id UUID;
    END IF;

    -- Add integration_type column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ticket_cache' 
        AND column_name = 'integration_type'
    ) THEN
        ALTER TABLE ticket_cache ADD COLUMN integration_type TEXT;
    END IF;
END $$;

-- Update existing records to have organization_id (if possible)
UPDATE ticket_cache 
SET organization_id = (
    SELECT i.org_id 
    FROM integrations i 
    WHERE i.id = ticket_cache.integration_id
    LIMIT 1
)
WHERE organization_id IS NULL 
AND integration_id IS NOT NULL;

-- Update integration_type based on integration
UPDATE ticket_cache 
SET integration_type = (
    SELECT i.type 
    FROM integrations i 
    WHERE i.id = ticket_cache.integration_id
    LIMIT 1
)
WHERE integration_type IS NULL 
AND integration_id IS NOT NULL;

-- Add foreign key constraint for organization_id (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'ticket_cache' 
        AND constraint_name = 'fk_ticket_cache_organization'
    ) THEN
        ALTER TABLE ticket_cache 
        ADD CONSTRAINT fk_ticket_cache_organization 
        FOREIGN KEY (organization_id) 
        REFERENCES organizations(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_ticket_cache_organization_id ON ticket_cache(organization_id);
CREATE INDEX IF NOT EXISTS idx_ticket_cache_external_ticket_id ON ticket_cache(external_ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_cache_integration_type ON ticket_cache(integration_type);

-- Update RLS policies for ticket_cache
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