-- Create organizations table
CREATE TABLE organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create integrations table
CREATE TABLE integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  config JSONB NOT NULL
);

-- Create release_notes table
CREATE TABLE release_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  content TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX organizations_user_id_idx ON organizations(user_id);
CREATE INDEX integrations_organization_id_idx ON integrations(organization_id);
CREATE INDEX release_notes_organization_id_idx ON release_notes(organization_id);

-- Set up Row Level Security (RLS)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE release_notes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own organizations"
  ON organizations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own organizations"
  ON organizations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own organizations"
  ON organizations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own organizations"
  ON organizations FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view integrations for their organizations"
  ON integrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = integrations.organization_id
      AND organizations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert integrations for their organizations"
  ON integrations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = integrations.organization_id
      AND organizations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update integrations for their organizations"
  ON integrations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = integrations.organization_id
      AND organizations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete integrations for their organizations"
  ON integrations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = integrations.organization_id
      AND organizations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view release notes for their organizations"
  ON release_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = release_notes.organization_id
      AND organizations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert release notes for their organizations"
  ON release_notes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = release_notes.organization_id
      AND organizations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update release notes for their organizations"
  ON release_notes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = release_notes.organization_id
      AND organizations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete release notes for their organizations"
  ON release_notes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = release_notes.organization_id
      AND organizations.user_id = auth.uid()
    )
  ); 