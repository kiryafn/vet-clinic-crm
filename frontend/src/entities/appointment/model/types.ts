export enum AppointmentStatus {
    PLANNED = 'planned',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}

export interface Appointment {
    id: number;
    date_time: string;
    duration_minutes: number;
    status: AppointmentStatus;
    reason: string;
    doctor_notes?: string;
    user_description?: string;

    doctor: {
        id: number;
        full_name: string;
        specialization?: string | { name: string }; // Handle potential backend variations
        price: number;
    };
    pet: {
        id: number;
        name: string;
        species: string;
    };
    client?: { // Might be missing if viewed by client? No, always loaded.
        id: number;
        full_name: string;
        phone_number?: string;
    };
}

export interface AppointmentCreate {
    doctor_id: number;
    pet_id: number;
    date_time: string; // ISO
    user_description?: string;
}