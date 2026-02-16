-- Create the 'books' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'books', 
  'books', 
  true, 
  104857600, -- 100MB
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/epub+zip', 'text/plain']
)
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = 104857600;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can select books" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can insert books" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update books" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete books" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

-- Create policies for the 'books' bucket
-- Policy 1: Allow authenticated users to view/download files
CREATE POLICY "Authenticated users can select books"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'books');

-- Policy 2: Allow authenticated users to upload files
CREATE POLICY "Authenticated users can insert books"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'books');

-- Policy 3: Allow authenticated users to update their own files (or all files if admin, simplifying to auth users for now as per request)
CREATE POLICY "Authenticated users can update books"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'books');

-- Policy 4: Allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete books"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'books');
