export const DoctorSpecialization = {
    OPHTHALMOLOGIST: 'OPHTHALMOLOGIST',
    DERMATOLOGIST: 'DERMATOLOGIST',
    CARDIOLOGIST: 'CARDIOLOGIST',
    THERAPIST: 'THERAPIST',
    SURGEON: 'SURGEON',
    DENTIST: 'DENTIST'
} as const;

export type DoctorSpecialization = typeof DoctorSpecialization[keyof typeof DoctorSpecialization];

export interface Doctor {
    id: number;
    full_name: string;
    experience_years: number;
    phone_number?: string;
    bio?: string;
    specialization: DoctorSpecialization;
    price?: number;
}

export interface DoctorCreate {
    email: string;
    password: string;
    full_name: string;
    specialization: DoctorSpecialization;
    phone_number?: string;
    experience_years?: number;
    price?: number;
    bio?: string;
}
