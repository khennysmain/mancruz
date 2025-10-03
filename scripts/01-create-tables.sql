-- Create database tables for Barangay Complaint System

-- Users table for residents and admin
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    address TEXT,
    barangay VARCHAR(100),
    role VARCHAR(20) DEFAULT 'resident' CHECK (role IN ('resident', 'admin', 'barangay_official')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Complaints table
CREATE TABLE IF NOT EXISTS complaints (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    complainant_name VARCHAR(255) NOT NULL,
    complainant_email VARCHAR(255),
    complainant_phone VARCHAR(20),
    complainant_address TEXT,
    complaint_type VARCHAR(50) NOT NULL CHECK (complaint_type IN ('noise', 'garbage', 'illegal_parking', 'public_safety', 'infrastructure', 'other')),
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed', 'rejected')),
    assigned_to VARCHAR(255),
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Incidents table
CREATE TABLE IF NOT EXISTS incidents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    reporter_name VARCHAR(255) NOT NULL,
    reporter_email VARCHAR(255),
    reporter_phone VARCHAR(20),
    reporter_address TEXT,
    incident_type VARCHAR(50) NOT NULL CHECK (incident_type IN ('accident', 'crime', 'fire', 'flood', 'medical_emergency', 'public_disturbance', 'other')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    incident_date TIMESTAMP WITH TIME ZONE NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) DEFAULT 'reported' CHECK (status IN ('reported', 'investigating', 'resolved', 'closed')),
    assigned_to VARCHAR(255),
    action_taken TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('complaint', 'incident')),
    entity_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    performed_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File attachments table
CREATE TABLE IF NOT EXISTS file_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('complaint', 'incident')),
    entity_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_complaints_reference ON complaints(reference_number);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_created ON complaints(created_at);
CREATE INDEX IF NOT EXISTS idx_incidents_reference ON incidents(reference_number);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_created ON incidents(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);

-- Function to generate reference numbers
CREATE OR REPLACE FUNCTION generate_reference_number(entity_type TEXT)
RETURNS TEXT AS $$
DECLARE
    prefix TEXT;
    year_part TEXT;
    sequence_num INTEGER;
    reference_num TEXT;
BEGIN
    -- Set prefix based on entity type
    IF entity_type = 'complaint' THEN
        prefix := 'CMP';
    ELSIF entity_type = 'incident' THEN
        prefix := 'INC';
    ELSE
        prefix := 'REF';
    END IF;
    
    -- Get current year
    year_part := EXTRACT(YEAR FROM NOW())::TEXT;
    
    -- Get next sequence number for this year and type
    SELECT COALESCE(MAX(CAST(SUBSTRING(reference_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM (
        SELECT reference_number FROM complaints WHERE reference_number LIKE prefix || '-' || year_part || '-%'
        UNION ALL
        SELECT reference_number FROM incidents WHERE reference_number LIKE prefix || '-' || year_part || '-%'
    ) AS refs;
    
    -- Format reference number
    reference_num := prefix || '-' || year_part || '-' || LPAD(sequence_num::TEXT, 3, '0');
    
    RETURN reference_num;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-generate reference numbers
CREATE OR REPLACE FUNCTION set_complaint_reference()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.reference_number IS NULL OR NEW.reference_number = '' THEN
        NEW.reference_number := generate_reference_number('complaint');
    END IF;
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_incident_reference()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.reference_number IS NULL OR NEW.reference_number = '' THEN
        NEW.reference_number := generate_reference_number('incident');
    END IF;
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_complaint_reference ON complaints;
CREATE TRIGGER trigger_complaint_reference
    BEFORE INSERT OR UPDATE ON complaints
    FOR EACH ROW EXECUTE FUNCTION set_complaint_reference();

DROP TRIGGER IF EXISTS trigger_incident_reference ON incidents;
CREATE TRIGGER trigger_incident_reference
    BEFORE INSERT OR UPDATE ON incidents
    FOR EACH ROW EXECUTE FUNCTION set_incident_reference();
