-- Consolidated migration: Categories, Tags, and CSS Customization
-- Merges: add_categories_tags.sql and add_custom_css.sql
-- Date: 2025-01-08

-- ======================================
-- 1. CATEGORIES AND TAGS SYSTEM
-- ======================================

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

-- ======================================
-- 2. CSS CUSTOMIZATION SYSTEM
-- ======================================

-- Add custom CSS support to organizations table
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS custom_css TEXT,
ADD COLUMN IF NOT EXISTS custom_css_enabled BOOLEAN DEFAULT FALSE;

-- Create custom CSS themes table for predefined themes
CREATE TABLE IF NOT EXISTS css_themes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'custom',
  css_variables JSONB NOT NULL,
  custom_css TEXT,
  preview_image_url TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CSS customization history for organizations
CREATE TABLE IF NOT EXISTS css_customization_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  custom_css TEXT,
  css_variables JSONB,
  applied_by UUID REFERENCES auth.users(id),
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT FALSE
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_css_themes_category ON css_themes(category);
CREATE INDEX IF NOT EXISTS idx_css_themes_public ON css_themes(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_css_customization_history_org ON css_customization_history(organization_id);
CREATE INDEX IF NOT EXISTS idx_css_customization_history_active ON css_customization_history(organization_id, is_active) WHERE is_active = true;

-- ======================================
-- 3. ROW LEVEL SECURITY POLICIES
-- ======================================

-- Enable RLS for new tables
ALTER TABLE release_note_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE css_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE css_customization_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for categories
DROP POLICY IF EXISTS "Users can view categories for their organization" ON release_note_categories;
CREATE POLICY "Users can view categories for their organization" ON release_note_categories
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can manage categories for their organization" ON release_note_categories;
CREATE POLICY "Users can manage categories for their organization" ON release_note_categories
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin', 'editor')
    )
  );

-- RLS policies for css_themes
DROP POLICY IF EXISTS "Anyone can view public CSS themes" ON css_themes;
CREATE POLICY "Anyone can view public CSS themes" ON css_themes
  FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can view their own CSS themes" ON css_themes;
CREATE POLICY "Users can view their own CSS themes" ON css_themes
  FOR SELECT USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can create CSS themes" ON css_themes;
CREATE POLICY "Users can create CSS themes" ON css_themes
  FOR INSERT WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can update their own CSS themes" ON css_themes;
CREATE POLICY "Users can update their own CSS themes" ON css_themes
  FOR UPDATE USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own CSS themes" ON css_themes;
CREATE POLICY "Users can delete their own CSS themes" ON css_themes
  FOR DELETE USING (created_by = auth.uid());

-- RLS policies for css_customization_history
DROP POLICY IF EXISTS "Users can view CSS history for their organization" ON css_customization_history;
CREATE POLICY "Users can view CSS history for their organization" ON css_customization_history
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can manage CSS history for their organization" ON css_customization_history;
CREATE POLICY "Users can manage CSS history for their organization" ON css_customization_history
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- ======================================
-- 4. TRIGGERS AND FUNCTIONS
-- ======================================

-- Function to update updated_at timestamp (reusable)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at columns
DROP TRIGGER IF EXISTS update_release_note_categories_updated_at ON release_note_categories;
CREATE TRIGGER update_release_note_categories_updated_at 
  BEFORE UPDATE ON release_note_categories 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_css_themes_updated_at ON css_themes;
CREATE TRIGGER update_css_themes_updated_at 
  BEFORE UPDATE ON css_themes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to apply CSS customization and save to history
CREATE OR REPLACE FUNCTION apply_css_customization(
  org_id UUID,
  css_content TEXT,
  css_vars JSONB,
  user_id UUID
)
RETURNS UUID AS $$
DECLARE
  history_id UUID;
BEGIN
  -- Deactivate current customization
  UPDATE css_customization_history 
  SET is_active = FALSE 
  WHERE organization_id = org_id AND is_active = TRUE;
  
  -- Insert new customization
  INSERT INTO css_customization_history (
    organization_id, 
    custom_css, 
    css_variables, 
    applied_by,
    is_active
  ) VALUES (
    org_id, 
    css_content, 
    css_vars, 
    user_id,
    TRUE
  ) RETURNING id INTO history_id;
  
  -- Update organization
  UPDATE organizations 
  SET 
    custom_css = css_content,
    custom_css_enabled = TRUE,
    updated_at = NOW()
  WHERE id = org_id;
  
  RETURN history_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ======================================
-- 5. DEFAULT CSS THEMES
-- ======================================

-- Insert default CSS themes
INSERT INTO css_themes (name, description, category, css_variables, custom_css, is_public) VALUES
(
  'Clean Minimal',
  'Clean and minimal design with subtle shadows and rounded corners',
  'minimal',
  '{"brandColor": "#1a365d", "borderRadius": "8px", "spacing": "1rem", "fontFamily": "Inter, sans-serif"}',
  ':root { --shadow: 0 1px 3px rgba(0, 0, 0, 0.1); --text-color: #2d3748; } .release-note-card { box-shadow: var(--shadow); }',
  true
),
(
  'Modern Gradient',
  'Modern design with gradient accents and bold typography',
  'modern',
  '{"brandColor": "#6366f1", "borderRadius": "12px", "spacing": "1.5rem", "fontFamily": "Poppins, sans-serif"}',
  ':root { --gradient: linear-gradient(135deg, var(--brand-color), #8b5cf6); } .header { background: var(--gradient); }',
  true
),
(
  'Corporate Blue',
  'Professional corporate design with blue color scheme',
  'corporate',
  '{"brandColor": "#1e40af", "borderRadius": "4px", "spacing": "1rem", "fontFamily": "system-ui, sans-serif"}',
  ':root { --primary-light: #dbeafe; --border-color: #e5e7eb; } .content { border: 1px solid var(--border-color); }',
  true
),
(
  'Tech Dark',
  'Dark theme optimized for technical content and developers',
  'dark',
  '{"brandColor": "#10b981", "borderRadius": "6px", "spacing": "1.25rem", "fontFamily": "JetBrains Mono, monospace"}',
  ':root { --bg-dark: #1f2937; --text-light: #f9fafb; } body { background: var(--bg-dark); color: var(--text-light); }',
  true
) ON CONFLICT DO NOTHING;