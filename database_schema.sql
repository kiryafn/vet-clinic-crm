-- ============================================
-- Vet Clinic CRM Database Schema
-- SQL representation of the database structure
-- ============================================

-- Enable UUID extension if needed
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

-- User roles enum
CREATE TYPE user_role AS ENUM ('admin', 'doctor', 'client');

-- Doctor specializations enum
CREATE TYPE doctor_specialization AS ENUM (
    'OPHTHALMOLOGIST',
    'DERMATOLOGIST',
    'CARDIOLOGIST',
    'THERAPIST',
    'SURGEON',
    'DENTIST'
);

-- Pet species enum
CREATE TYPE pet_species AS ENUM (
    'DOG',
    'CAT',
    'BIRD',
    'FISH',
    'RABBIT',
    'HAMSTER',
    'GUINEA_PIG',
    'MOUSE_RAT',
    'FERRET',
    'REPTILE',
    'AMPHIBIAN',
    'HORSE',
    'LIVESTOCK',
    'EXOTIC',
    'OTHER'
);

-- Appointment status enum
CREATE TYPE appointment_status AS ENUM (
    'planned',
    'completed',
    'cancelled'
);

-- ============================================
-- TABLES
-- ============================================

-- Users table (authentication)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'client',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    CONSTRAINT users_email_unique UNIQUE (email)
);

CREATE INDEX idx_users_email ON users(email);

-- Doctors table
CREATE TABLE doctors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    specialization doctor_specialization NOT NULL DEFAULT 'THERAPIST',
    experience_years INTEGER NOT NULL DEFAULT 0,
    phone_number VARCHAR(20),
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    CONSTRAINT fk_doctors_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT doctors_user_id_unique UNIQUE (user_id)
);

CREATE INDEX idx_doctors_user_id ON doctors(user_id);

-- Clients table
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    address VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    CONSTRAINT fk_clients_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT clients_user_id_unique UNIQUE (user_id)
);

CREATE INDEX idx_clients_user_id ON clients(user_id);

-- Pets table
CREATE TABLE pets (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL,
    name VARCHAR(50) NOT NULL,
    species pet_species NOT NULL DEFAULT 'DOG',
    breed VARCHAR(50),
    birth_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    CONSTRAINT fk_pets_owner FOREIGN KEY (owner_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE INDEX idx_pets_owner_id ON pets(owner_id);

-- Appointments table
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    pet_id INTEGER NOT NULL,
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 45,
    status appointment_status NOT NULL DEFAULT 'planned',
    reason TEXT NOT NULL,
    doctor_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    CONSTRAINT fk_appointments_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    CONSTRAINT fk_appointments_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    CONSTRAINT fk_appointments_pet FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
);

CREATE INDEX idx_appointments_client_id ON appointments(client_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_pet_id ON appointments(pet_id);
CREATE INDEX idx_appointments_date_time ON appointments(date_time);
CREATE INDEX idx_appointments_status ON appointments(status);

-- ============================================
-- TRIGGERS for updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON pets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE users IS 'User authentication table - stores credentials and roles';
COMMENT ON TABLE doctors IS 'Doctor profiles - linked to users table';
COMMENT ON TABLE clients IS 'Client profiles - linked to users table';
COMMENT ON TABLE pets IS 'Pets owned by clients';
COMMENT ON TABLE appointments IS 'Appointments between clients, doctors and pets';

COMMENT ON COLUMN users.role IS 'User role: admin, doctor, or client';
COMMENT ON COLUMN doctors.specialization IS 'Medical specialization of the doctor';
COMMENT ON COLUMN pets.species IS 'Type of pet';
COMMENT ON COLUMN appointments.status IS 'Status: planned, completed, or cancelled';
COMMENT ON COLUMN appointments.duration_minutes IS 'Appointment duration in minutes (default 45)';

-- ============================================
-- VIEWS (Optional - for reporting)
-- ============================================

-- View: Active appointments
CREATE OR REPLACE VIEW active_appointments AS
SELECT 
    a.id,
    a.date_time,
    a.status,
    a.reason,
    c.full_name AS client_name,
    c.phone_number AS client_phone,
    d.full_name AS doctor_name,
    d.specialization,
    p.name AS pet_name,
    p.species AS pet_species
FROM appointments a
JOIN clients c ON a.client_id = c.id
JOIN doctors d ON a.doctor_id = d.id
JOIN pets p ON a.pet_id = p.id
WHERE a.status = 'planned'
ORDER BY a.date_time;

-- View: Doctor schedule
CREATE OR REPLACE VIEW doctor_schedule AS
SELECT 
    d.id AS doctor_id,
    d.full_name AS doctor_name,
    d.specialization,
    a.date_time,
    a.status,
    c.full_name AS client_name,
    p.name AS pet_name
FROM doctors d
LEFT JOIN appointments a ON d.id = a.doctor_id
LEFT JOIN clients c ON a.client_id = c.id
LEFT JOIN pets p ON a.pet_id = p.id
ORDER BY d.id, a.date_time;

-- ============================================
-- RELATIONSHIPS SUMMARY
-- ============================================
-- 
-- Users (1) <---> (0..1) Doctors
-- Users (1) <---> (0..1) Clients
-- Clients (1) <---> (N) Pets
-- Clients (1) <---> (N) Appointments
-- Doctors (1) <---> (N) Appointments
-- Pets (1) <---> (N) Appointments
--
-- ============================================
