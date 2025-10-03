-- Insert sample admin user
INSERT INTO users (email, full_name, phone_number, address, barangay, role) VALUES
('admin@barangay.gov.ph', 'Barangay Administrator', '+63-912-345-6789', 'Barangay Hall, Main Street', 'San Antonio', 'admin'),
('captain@barangay.gov.ph', 'Juan Dela Cruz', '+63-912-345-6790', 'Barangay Hall, Main Street', 'San Antonio', 'barangay_official');

-- Insert sample complaints
INSERT INTO complaints (complainant_name, complainant_email, complainant_phone, complainant_address, complaint_type, subject, description, location, priority) VALUES
('Maria Santos', 'maria.santos@email.com', '+63-912-111-2222', '123 Rizal Street, San Antonio', 'noise', 'Loud Music from Neighbor', 'My neighbor has been playing loud music every night until 2 AM, disturbing the peace in our area.', '125 Rizal Street, San Antonio', 'medium'),
('Pedro Garcia', 'pedro.garcia@email.com', '+63-912-333-4444', '456 Bonifacio Avenue, San Antonio', 'garbage', 'Uncollected Garbage', 'Garbage has not been collected for over a week in our street. It is starting to smell and attract pests.', 'Bonifacio Avenue corner Mabini Street', 'high'),
('Ana Reyes', 'ana.reyes@email.com', '+63-912-555-6666', '789 Jose Rizal Road, San Antonio', 'infrastructure', 'Broken Street Light', 'The street light in front of our house has been broken for 2 months, making the area unsafe at night.', '789 Jose Rizal Road, San Antonio', 'medium');

-- Insert sample incidents
INSERT INTO incidents (reporter_name, reporter_email, reporter_phone, reporter_address, incident_type, title, description, location, incident_date, severity) VALUES
('Carlos Mendoza', 'carlos.mendoza@email.com', '+63-912-777-8888', '321 Luna Street, San Antonio', 'accident', 'Motorcycle Accident', 'A motorcycle collided with a tricycle at the intersection. Minor injuries reported.', 'Luna Street corner Quezon Avenue', '2024-01-15 14:30:00+08', 'medium'),
('Rosa Villanueva', 'rosa.villanueva@email.com', '+63-912-999-0000', '654 Mabini Street, San Antonio', 'public_disturbance', 'Street Fight', 'Two groups of people were fighting in the street, causing traffic and safety concerns.', 'Mabini Street near the market', '2024-01-14 20:15:00+08', 'high');
