import { useState } from 'react';
import { sessionApi } from '../../../../entities/session/api/sessionApi';
import type { RegisterParams } from '../../../../entities/session/api/types';
import { useLogin } from '../../login/model/useLogin';

export const useRegister = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { login } = useLogin();

    const register = async (params: RegisterParams) => {
        setIsLoading(true);
        setError(null);
        try {
            await sessionApi.register(params);
            // Auto login after register
            await login({ email: params.email, password: params.password });
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return { register, isLoading, error };
};
