import { api } from '../../../shared/api/api';
import type { User } from '../../user/model/types';
import type { AuthResponse } from '../model/types';
import type { LoginParams, RegisterParams } from './types';

export const sessionApi = {
    login: async (params: LoginParams): Promise<AuthResponse> => {
        const formData = new URLSearchParams();
        formData.append('username', params.email);
        formData.append('password', params.password);

        // OAuth2PasswordRequestForm expects form-data
        const response = await api.post<AuthResponse>('/users/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        return response.data;
    },

    register: async (params: RegisterParams): Promise<User> => {
        const response = await api.post<User>('/users/', params);
        return response.data;
    },

    getMe: async (): Promise<User> => {
        const response = await api.get<User>('/users/me');
        return response.data;
    },
};
