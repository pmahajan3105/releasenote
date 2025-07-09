-- Update templates table to match AITemplate interface
-- This migration expands the basic templates table to support the full AITemplate structure

-- Add new columns to templates table
ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'modern',
ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '📝',
ADD COLUMN IF NOT EXISTS system_prompt TEXT,
ADD COLUMN IF NOT EXISTS user_prompt_template TEXT,
ADD COLUMN IF NOT EXISTS output_format TEXT DEFAULT 'html',
ADD COLUMN IF NOT EXISTS tone TEXT DEFAULT 'professional',
ADD COLUMN IF NOT EXISTS target_audience TEXT DEFAULT 'mixed',
ADD COLUMN IF NOT EXISTS example_output TEXT;

-- Update existing templates to have proper values
UPDATE templates 
SET 
  description = COALESCE(description, 'Template description'),
  category = COALESCE(category, 'modern'),
  icon = COALESCE(icon, '📝'),
  system_prompt = COALESCE(system_prompt, 'You are a professional release note generator. Create clear, engaging release notes that communicate value to users.'),
  user_prompt_template = COALESCE(user_prompt_template, 'Generate a release note with the following content: {content}'),
  output_format = COALESCE(output_format, 'html'),
  tone = COALESCE(tone, 'professional'),
  target_audience = COALESCE(target_audience, 'mixed'),
  example_output = COALESCE(example_output, 'Example release note output would appear here.')
WHERE description IS NULL 
   OR category IS NULL 
   OR icon IS NULL 
   OR system_prompt IS NULL 
   OR user_prompt_template IS NULL 
   OR output_format IS NULL 
   OR tone IS NULL 
   OR target_audience IS NULL 
   OR example_output IS NULL;

-- Add constraints
ALTER TABLE templates 
ADD CONSTRAINT check_category CHECK (category IN ('traditional', 'modern', 'technical', 'marketing', 'changelog', 'minimal')),
ADD CONSTRAINT check_output_format CHECK (output_format IN ('markdown', 'html')),
ADD CONSTRAINT check_tone CHECK (tone IN ('professional', 'casual', 'technical', 'enthusiastic', 'formal')),
ADD CONSTRAINT check_target_audience CHECK (target_audience IN ('developers', 'business', 'users', 'mixed'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_tone ON templates(tone);
CREATE INDEX IF NOT EXISTS idx_templates_target_audience ON templates(target_audience);

-- Insert default templates if none exist
INSERT INTO templates (
  organization_id, 
  name, 
  content, 
  description, 
  category, 
  icon, 
  system_prompt, 
  user_prompt_template, 
  output_format, 
  tone, 
  target_audience, 
  example_output,
  is_default
) 
SELECT 
  o.id as organization_id,
  'Modern Release Notes' as name,
  '<h1>{{title}}</h1><p>{{content}}</p>' as content,
  'Clean, modern template perfect for product updates' as description,
  'modern' as category,
  '✨' as icon,
  'You are a professional release note generator. Create clear, engaging release notes that communicate value to users in a modern, clean format.' as system_prompt,
  'Generate a modern release note with the following content: {content}. Focus on user benefits and clear communication.' as user_prompt_template,
  'html' as output_format,
  'professional' as tone,
  'mixed' as target_audience,
  '<h1>🚀 New Features</h1><p>We''ve added exciting new functionality to improve your experience...</p>' as example_output,
  true as is_default
FROM organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM templates t WHERE t.organization_id = o.id
);

-- Update RLS policies to work with new schema
DROP POLICY IF EXISTS "Users can manage templates in their organization" ON templates;
CREATE POLICY "Users can manage templates in their organization" ON templates
  FOR ALL
  USING (
    organization_id IN (
      SELECT om.organization_id 
      FROM organization_members om 
      WHERE om.user_id = auth.uid()
    )
  );