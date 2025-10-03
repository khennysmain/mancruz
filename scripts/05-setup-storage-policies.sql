-- Setup Supabase Storage for Image Uploads
-- Create storage bucket for complaint/incident images

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'complaint-images',
    'complaint-images',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies for public read access
CREATE POLICY IF NOT EXISTS "Public read access for complaint images"
ON storage.objects FOR SELECT
USING (bucket_id = 'complaint-images');

-- Create storage policy for authenticated uploads
CREATE POLICY IF NOT EXISTS "Authenticated users can upload complaint images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'complaint-images');

-- Create storage policy for users to update their own uploads
CREATE POLICY IF NOT EXISTS "Users can update their own complaint images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'complaint-images');

-- Create storage policy for users to delete their own uploads
CREATE POLICY IF NOT EXISTS "Users can delete their own complaint images"
ON storage.objects FOR DELETE
USING (bucket_id = 'complaint-images');
