import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionApi } from '../../../../entities/session/api/sessionApi';
import type { LoginParams } from '../../../../entities/session/api/types';
import { useAuth } from '../../../../entities/session/model/store';

export const useLogin = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { checkAuth } = useAuth();
    const navigate = useNavigate();

    const login = async (params: LoginParams) => {
        setIsLoading(true);
        setError(null);
        try {
            const { access_token } = await sessionApi.login(params);
            localStorage.setItem('token', access_token);
            await checkAuth();
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return { login, isLoading, error };
};
