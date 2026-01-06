import { api } from '../../../shared/api/api';
import type { Pet, PetCreate, PetUpdate } from '../model/types';

export const petApi = {
    getAll: async (): Promise<Pet[]> => {
        const response = await api.get<Pet[]>('/pets/');
        return response.data;
    },

    create: async (payload: PetCreate): Promise<Pet> => {
        const response = await api.post<Pet>('/pets/', payload);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/pets/${id}`);
    },

    update: async (id: number, payload: PetUpdate): Promise<Pet> => {
        const response = await api.patch<Pet>(`/pets/${id}`, payload);
        return response.data;
    }
};