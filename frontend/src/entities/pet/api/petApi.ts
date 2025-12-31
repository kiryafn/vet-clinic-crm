import { api } from '../../../shared/api/api';
import type { Pet, CreatePetPayload } from '../model/types';

export const petApi = {
    getAll: async (): Promise<Pet[]> => {
        const response = await api.get<Pet[]>('/pets/');
        return response.data;
    },

    create: async (payload: CreatePetPayload): Promise<Pet> => {
        const response = await api.post<Pet>('/pets/', payload);
        return response.data;
    }
};