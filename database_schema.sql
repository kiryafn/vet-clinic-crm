CREATE TYPE user_role AS ENUM ('admin', 'doctor', 'client');

CREATE TYPE doctor_specialization AS ENUM (
    'OPHTHALMOLOGIST',
    'DERMATOLOGIST',
    'CARDIOLOGIST',
    'THERAPIST',
    'SURGEON',
    'DENTIST'
);

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

CREATE TYPE appointment_status AS ENUM (
    'planned',
    'completed',
    'cancelled'
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'client',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT users_email_unique UNIQUE (email)
);

CREATE INDEX idx_users_email ON users(email);

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
    
    CONSTRAINT fk_doctors_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT doctors_user_id_unique UNIQUE (user_id)
);

CREATE INDEX idx_doctors_user_id ON doctors(user_id);

CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    address VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_clients_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT clients_user_id_unique UNIQUE (user_id)
);

CREATE INDEX idx_clients_user_id ON clients(user_id);

CREATE TABLE pets (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL,
    name VARCHAR(50) NOT NULL,
    species pet_species NOT NULL DEFAULT 'DOG',
    breed VARCHAR(50),
    birth_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_pets_owner FOREIGN KEY (owner_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE INDEX idx_pets_owner_id ON pets(owner_id);

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
    
    CONSTRAINT fk_appointments_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    CONSTRAINT fk_appointments_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    CONSTRAINT fk_appointments_pet FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
);

CREATE INDEX idx_appointments_client_id ON appointments(client_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_pet_id ON appointments(pet_id);
CREATE INDEX idx_appointments_date_time ON appointments(date_time);
CREATE INDEX idx_appointments_status ON appointments(status);
