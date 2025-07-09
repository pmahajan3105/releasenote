-- Add AI Context table for customizable AI behavior
-- This table stores organization-specific AI context settings

CREATE TABLE IF NOT EXISTS ai_context (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  system_prompt text NOT NULL,
  user_prompt_template text NOT NULL,
  example_output text,
  tone text,
  audience text,
  output_format text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Unique constraint to ensure one context per organization
CREATE UNIQUE INDEX IF NOT EXISTS ai_context_organization_id_idx ON ai_context(organization_id);

-- Enable RLS
ALTER TABLE ai_context ENABLE ROW LEVEL SECURITY;

-- RLS policies for ai_context
CREATE POLICY "Organizations can view their own AI context"
  ON ai_context FOR SELECT
  USING (organization_id = auth.uid());

CREATE POLICY "Organizations can insert their own AI context"
  ON ai_context FOR INSERT
  WITH CHECK (organization_id = auth.uid());

CREATE POLICY "Organizations can update their own AI context"
  ON ai_context FOR UPDATE
  USING (organization_id = auth.uid())
  WITH CHECK (organization_id = auth.uid());

CREATE POLICY "Organizations can delete their own AI context"
  ON ai_context FOR DELETE
  USING (organization_id = auth.uid());

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_ai_context_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_context_updated_at_trigger
  BEFORE UPDATE ON ai_context
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_context_updated_at();