-- Reset Database Schema for Enhanced Barangay Complaint System
-- Remove priority fields and add new features

-- First, let's add the new columns to existing tables
ALTER TABLE complaints 
DROP COLUMN IF EXISTS priority,
ADD COLUMN IF NOT EXISTS purok VARCHAR(50),
ADD COLUMN IF NOT EXISTS landmark TEXT,
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS other_description TEXT;

ALTER TABLE incidents 
DROP COLUMN IF EXISTS severity,
ADD COLUMN IF NOT EXISTS purok VARCHAR(50),
ADD COLUMN IF NOT EXISTS landmark TEXT,
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS other_description TEXT;

-- Create puroks table for Barangay Mancruz (8 puroks)
CREATE TABLE IF NOT EXISTS puroks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the 8 puroks of Barangay Mancruz
INSERT INTO puroks (name, description) VALUES
('Purok 1', 'Purok 1 - Barangay Mancruz'),
('Purok 2', 'Purok 2 - Barangay Mancruz'),
('Purok 3', 'Purok 3 - Barangay Mancruz'),
('Purok 4', 'Purok 4 - Barangay Mancruz'),
('Purok 5', 'Purok 5 - Barangay Mancruz'),
('Purok 6', 'Purok 6 - Barangay Mancruz'),
('Purok 7', 'Purok 7 - Barangay Mancruz'),
('Purok 8', 'Purok 8 - Barangay Mancruz')
ON CONFLICT DO NOTHING;

-- Removed emergency contacts table creation and data insertion

-- Create landmarks table for common locations in Barangay Mancruz
CREATE TABLE IF NOT EXISTS landmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    purok VARCHAR(50),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert common landmarks in Barangay Mancruz
INSERT INTO landmarks (name, purok, description) VALUES
('Barangay Hall', 'Purok 1', 'Main Barangay Office'),
('Mancruz Elementary School', 'Purok 2', 'Public Elementary School'),
('Mancruz Health Center', 'Purok 3', 'Barangay Health Station'),
('Mancruz Chapel', 'Purok 4', 'Community Chapel'),
('Mancruz Basketball Court', 'Purok 5', 'Main Basketball Court'),
('Mancruz Market', 'Purok 6', 'Local Market Area'),
('Mancruz Bridge', 'Purok 7', 'Main Bridge'),
('Mancruz Cemetery', 'Purok 8', 'Community Cemetery')
ON CONFLICT DO NOTHING;

-- Update file_attachments table to support images
ALTER TABLE file_attachments 
ADD COLUMN IF NOT EXISTS is_image BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS thumbnail_path VARCHAR(500),
ADD COLUMN IF NOT EXISTS alt_text TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_complaints_purok ON complaints(purok);
CREATE INDEX IF NOT EXISTS idx_complaints_is_anonymous ON complaints(is_anonymous);
CREATE INDEX IF NOT EXISTS idx_incidents_purok ON incidents(purok);
CREATE INDEX IF NOT EXISTS idx_incidents_is_anonymous ON incidents(is_anonymous);
CREATE INDEX IF NOT EXISTS idx_landmarks_purok ON landmarks(purok);
-- Removed emergency contacts index
