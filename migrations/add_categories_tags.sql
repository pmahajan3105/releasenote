-- Add category and tags support to release_notes table
ALTER TABLE release_notes 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS featured_image_url TEXT,
ADD COLUMN IF NOT EXISTS excerpt TEXT;

-- Create category management table
CREATE TABLE IF NOT EXISTS release_note_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#7F56D9',
  slug TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, slug)
);

-- Add indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_release_notes_category ON release_notes(category);
CREATE INDEX IF NOT EXISTS idx_release_notes_tags ON release_notes USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_release_notes_search ON release_notes(title, content_html);
CREATE INDEX IF NOT EXISTS idx_release_notes_org_status_published ON release_notes(organization_id, status, published_at DESC) WHERE status = 'published';

-- Add RLS policies for categories
ALTER TABLE release_note_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view categories for their organization" ON release_note_categories
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage categories for their organization" ON release_note_categories
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin', 'editor')
    )
  );

-- Update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_release_note_categories_updated_at 
  BEFORE UPDATE ON release_note_categories 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();