export const AppointmentStatus = {
    PLANNED: 'planned',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
}

export type AppointmentStatus = typeof AppointmentStatus[keyof typeof AppointmentStatus];

export interface Appointment {
    id: number;
    date_time: string;
    duration_minutes: number;
    status: AppointmentStatus;
    doctor_notes?: string;
    reason?: string;

    doctor: {
        id: number;
        full_name: string;
        specialization?: string;
    };
    pet: {
        id: number;
        name: string;
        species: string;
    };
    client?: {
        id: number;
        full_name: string;
        phone_number?: string;
    };
}

export interface AppointmentCreate {
    doctor_id: number;
    pet_id: number;
    date_time: string;
    reason?: string;
}