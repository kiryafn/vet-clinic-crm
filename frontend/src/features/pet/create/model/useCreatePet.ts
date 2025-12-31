import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { petApi } from '../../../../entities/pet';
import { PetSpecies } from '../../../../entities/pet';

interface CreatePetFormValues {
    name: string;
    species: PetSpecies;
    breed: string;
    age: string; // В форме мы вводим возраст числом (строкой), а не дату
    weight: string; // Пока игнорируем или сохраним в notes, если бэк не поддерживает
}

export const useCreatePet = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createPet = async (values: CreatePetFormValues) => {
        setIsLoading(true);
        setError(null);

        try {
            // Бизнес-логика: превращаем возраст в год рождения
            // (если поле пустое, отправляем null)
            let birthDate = null;
            if (values.age) {
                const birthYear = new Date().getFullYear() - parseInt(values.age);
                birthDate = `${birthYear}-01-01`;
            }

            await petApi.create({
                name: values.name,
                species: values.species,
                breed: values.breed || null,
                birth_date: birthDate,
                // weight пока игнорируем, так как в схеме бэкенда его нет
            });

            // Успех -> редирект
            navigate('/');
        } catch (err: any) {
            // Обработка ошибок (можно вынести в shared/lib/errorHandler)
            const detail = err.response?.data?.detail;
            if (Array.isArray(detail)) {
                setError(detail.map((e: any) => `${e.loc.join('.')}: ${e.msg}`).join(', '));
            } else if (typeof detail === 'string') {
                setError(detail);
            } else {
                setError('Failed to add pet');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return { createPet, isLoading, error };
};