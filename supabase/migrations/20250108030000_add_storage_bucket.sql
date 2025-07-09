-- Create storage bucket for release note images
-- This bucket will store images uploaded via the rich text editor

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'release-note-images',
  'release-note-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects (if not already enabled)
-- Note: This may already be enabled in Supabase by default
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow public read access to images
DROP POLICY IF EXISTS "Public can view release note images" ON storage.objects;
CREATE POLICY "Public can view release note images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'release-note-images');

-- Allow authenticated users to upload images
DROP POLICY IF EXISTS "Authenticated users can upload release note images" ON storage.objects;
CREATE POLICY "Authenticated users can upload release note images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'release-note-images' 
    AND auth.role() = 'authenticated'
  );

-- Allow users to update their own images
DROP POLICY IF EXISTS "Users can update their own release note images" ON storage.objects;
CREATE POLICY "Users can update their own release note images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'release-note-images' 
    AND auth.uid() = owner
  )
  WITH CHECK (
    bucket_id = 'release-note-images' 
    AND auth.uid() = owner
  );

-- Allow users to delete their own images
DROP POLICY IF EXISTS "Users can delete their own release note images" ON storage.objects;
CREATE POLICY "Users can delete their own release note images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'release-note-images' 
    AND auth.uid() = owner
  );