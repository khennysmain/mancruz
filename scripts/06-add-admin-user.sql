-- Add admin user for Barangay Mancruz system
-- Email: barangaymancruzmain@gmail.com
-- This script adds the admin user to the users table

INSERT INTO users (
    email, 
    full_name, 
    phone_number, 
    address, 
    barangay, 
    role
) VALUES (
    'barangaymancruzmain@gmail.com',
    'Barangay Mancruz Administrator',
    '+63-912-345-6789',
    'Barangay Hall, Mancruz, Daet, Camarines Norte',
    'Mancruz',
    'admin'
) ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone_number = EXCLUDED.phone_number,
    address = EXCLUDED.address,
    barangay = EXCLUDED.barangay,
    role = EXCLUDED.role,
    updated_at = NOW();

-- Verify the admin user was created
SELECT email, full_name, role, created_at 
FROM users 
WHERE email = 'barangaymancruzmain@gmail.com';
