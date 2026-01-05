import { api } from '../../../shared/api/api';
import type { Pet, PetCreate } from '../model/types';

export const petApi = {
    getAll: async (): Promise<Pet[]> => {
        const response = await api.get<Pet[]>('/pets/');
        return response.data;
    },

    create: async (payload: PetCreate): Promise<Pet> => {
        const response = await api.post<Pet>('/pets/', payload);
        return response.data;
    }
};