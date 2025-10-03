-- Remove Emergency Contacts from Database
-- This script removes the emergency_contacts table and related data

-- Drop the emergency contacts table
DROP TABLE IF EXISTS emergency_contacts CASCADE;

-- Remove any indexes related to emergency contacts
DROP INDEX IF EXISTS idx_emergency_contacts_active;

-- Clean up any references in other tables (if any exist)
-- Note: This is a safety measure in case there are foreign key references
