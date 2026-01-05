import { api } from '../../../shared/api/api';
import type { Pet, PetCreateDto } from '../model/types';

export const petApi = {
    getAll: async (): Promise<Pet[]> => {
        const response = await api.get<Pet[]>('/pets/');
        return response.data;
    },

    create: async (payload: PetCreateDto): Promise<Pet> => {
        const response = await api.post<Pet>('/pets/', payload);
        return response.data;
    }
};