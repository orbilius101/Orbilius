-- =============================================
-- STORAGE BUCKET RLS POLICIES
-- =============================================
-- Run this in your Supabase SQL Editor to set up
-- storage policies for the student-submissions bucket
-- =============================================

-- First, ensure the bucket exists and is private
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-submissions', 'student-submissions', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to read files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete files" ON storage.objects;

-- Policy 1: Allow authenticated users to upload (INSERT) files
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'student-submissions'
);

-- Policy 2: Allow authenticated users to read (SELECT) files
CREATE POLICY "Allow authenticated users to read files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'student-submissions'
);

-- Policy 3: Allow authenticated users to update files
CREATE POLICY "Allow authenticated users to update files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'student-submissions'
)
WITH CHECK (
  bucket_id = 'student-submissions'
);

-- Policy 4: Allow authenticated users to delete files
CREATE POLICY "Allow authenticated users to delete files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'student-submissions'
);

-- Verify policies were created
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
ORDER BY policyname;
