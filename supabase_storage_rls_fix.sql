-- Enable RLS on storage.objects (Actually, this is usually enabled by default and requires owner privileges. Skipping.)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create 'books' bucket if it doesn't exist
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

-- Drop existing policies to ensure a clean slate
DROP POLICY IF EXISTS "Authenticated users can select books" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can insert books" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update books" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete books" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Give me access" ON storage.objects;

-- Policy 1: SELECT (Public Read due to public bucket, but explicitly allow auth users too)
CREATE POLICY "Authenticated users can select books"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'books'::text);

-- Policy 2: INSERT (Allow all authenticated users)
CREATE POLICY "Authenticated users can insert books"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'books'::text);

-- Policy 3: UPDATE (Allow all authenticated users - useful for upsert)
CREATE POLICY "Authenticated users can update books"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'books'::text);

-- Policy 4: DELETE (Allow all authenticated users)
CREATE POLICY "Authenticated users can delete books"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'books'::text);

-- Public access policy (for download/viewing by public if needed, though app uses auth)
CREATE POLICY "Public can view books"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'books'::text);
