-- Add custom domain and meta tags support to organizations table
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS custom_domain TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS domain_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS meta_image_url TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS favicon_url TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS brand_color TEXT DEFAULT '#7F56D9';

-- Create domain verification table for DNS verification
CREATE TABLE IF NOT EXISTS domain_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  verification_token TEXT NOT NULL,
  verification_method TEXT DEFAULT 'dns', -- 'dns', 'file'
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for domain verifications
ALTER TABLE domain_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own domain verifications" ON domain_verifications
  FOR ALL USING (
    organization_id IN (
      SELECT id FROM organizations WHERE user_id = auth.uid()
    )
  );

-- Add meta tags support to release_notes table
ALTER TABLE release_notes ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE release_notes ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE release_notes ADD COLUMN IF NOT EXISTS meta_image_url TEXT;
ALTER TABLE release_notes ADD COLUMN IF NOT EXISTS og_title TEXT;
ALTER TABLE release_notes ADD COLUMN IF NOT EXISTS og_description TEXT;
ALTER TABLE release_notes ADD COLUMN IF NOT EXISTS twitter_title TEXT;
ALTER TABLE release_notes ADD COLUMN IF NOT EXISTS twitter_description TEXT;

-- Create index for custom domain lookups
CREATE INDEX IF NOT EXISTS idx_organizations_custom_domain ON organizations(custom_domain) WHERE custom_domain IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_domain_verifications_domain ON domain_verifications(domain);

-- Update organizations updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_domain_verifications_updated_at ON domain_verifications;
CREATE TRIGGER update_domain_verifications_updated_at
    BEFORE UPDATE ON domain_verifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();