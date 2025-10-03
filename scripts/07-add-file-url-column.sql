-- Add missing file_url column to fix image display issue
-- This column will store the public URL for accessing uploaded images

ALTER TABLE file_attachments 
ADD COLUMN IF NOT EXISTS file_url VARCHAR(500);

-- Create index for better performance when querying by file_url
CREATE INDEX IF NOT EXISTS idx_file_attachments_url ON file_attachments(file_url);

-- Update existing records to generate file_url from file_path
-- This will help recover any existing images that were uploaded
UPDATE file_attachments 
SET file_url = CASE 
    WHEN file_path IS NOT NULL THEN 
        'https://your-supabase-project.supabase.co/storage/v1/object/public/complaint-images/' || file_path
    ELSE NULL 
END
WHERE file_url IS NULL AND file_path IS NOT NULL;
