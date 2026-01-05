import type {PetSpecies} from "../../pet";

export const AppointmentStatus = {
    PLANNED: 'Planned',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
} as const;

export type AppointmentStatus = (typeof AppointmentStatus)[keyof typeof AppointmentStatus];

export interface Appointment {
    id: number;
    user_id: number;
    doctor_id: number;
    pet_id: number;
    date_time: string;
    duration_minutes: number;
    status: AppointmentStatus;
    reason?: string;
    doctor_notes?: string;

    pet?: {
        name: string;
        species: PetSpecies;

    };
    doctor?: {
        full_name: string;
        specialization: string;
    };
}

export interface CreateAppointmentDto {
    user_id: number;
    doctor_id: number;
    pet_id: number;
    date_time: string;
    reason: string;
}