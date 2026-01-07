import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionApi } from '../../../../entities/session/api/sessionApi';
import { useErrorHandler } from '../../../../shared/utils/errorHandler';

export const useRegister = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { extractError } = useErrorHandler();

    const register = async (data: any) => {
        setIsLoading(true);
        setError(null);

        try {
            // 2. Вызываем метод из sessionApi
            await sessionApi.register(data);

            // Успех -> редирект
            navigate('/login');
        } catch (err: any) {
            console.error("Registration error:", err);
            setError(extractError(err));
        } finally {
            setIsLoading(false);
        }
    };

    return { register, isLoading, error };
};