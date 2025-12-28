import { useState } from 'react';
import { api } from '../../../../shared/api';
import type { Doctor } from '../../../../entities/doctor/model/types';

interface CreateDoctorParams {
    email: string;
    password: string;
    full_name: string;
    specialization_id: number;
    price?: number;
    phone_number?: string;
    experience_years?: number;
}

export const useCreateDoctor = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const createDoctor = async (params: CreateDoctorParams) => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);
        try {
            await api.post<Doctor>('/doctors/', params);
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to create doctor');
        } finally {
            setIsLoading(false);
        }
    };

    return { createDoctor, isLoading, error, success };
};
