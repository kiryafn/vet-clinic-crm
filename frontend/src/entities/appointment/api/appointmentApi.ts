import { api } from '../../../shared/api/api';
import type { Appointment, AppointmentCreate } from '../model/types';

export const appointmentApi = {
    getAll: async () => {
        const response = await api.get<Appointment[]>('/appointments/');
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
    }
};
