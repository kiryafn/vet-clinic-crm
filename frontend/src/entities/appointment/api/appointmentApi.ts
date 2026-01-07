import { api } from '../../../shared/api/api';
import type { Appointment, AppointmentCreate } from '../model/types';

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
}

export interface GetAppointmentsParams {
    page?: number;
    limit?: number;
    start_date?: string;
    end_date?: string;
}

export const appointmentApi = {
    getAll: async (params: GetAppointmentsParams = {}) => {
        const response = await api.get<PaginatedResponse<Appointment>>('/appointments/', { params });
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get<Appointment>(`/appointments/${id}`);
        return response.data;
    },

    create: async (data: AppointmentCreate) => {
        const response = await api.post<Appointment>('/appointments/', data);
        return response.data;
    },

    getSlots: async (doctorId: number, date: string) => {
        const response = await api.get<string[]>('/appointments/slots', {
            params: { doctor_id: doctorId, date }
        });
        return response.data;
    },

    cancel: async (id: number) => {
        const response = await api.put<Appointment>(`/appointments/${id}/cancel`);
        return response.data;
    },

    complete: async (id: number) => {
        const response = await api.put<Appointment>(`/appointments/${id}/complete`);
        return response.data;
    },

    delete: async (id: number) => {
        await api.delete(`/appointments/${id}`);
    }
};