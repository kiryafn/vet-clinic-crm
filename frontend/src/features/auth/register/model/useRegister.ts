import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionApi } from '../../../../entities/session/api/sessionApi';

export const useRegister = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

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

            // Обработка ошибок (оставляем как было, она правильная)
            if (err.response && err.response.data) {
                const detail = err.response.data.detail;

                if (Array.isArray(detail)) {
                    setError(detail[0].msg);
                } else if (typeof detail === 'string') {
                    setError(detail);
                } else {
                    setError('Registration failed. Please try again.');
                }
            } else if (err.request) {
                setError('No response from server. Check your internet connection.');
            } else {
                setError('Something went wrong.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return { register, isLoading, error };
};