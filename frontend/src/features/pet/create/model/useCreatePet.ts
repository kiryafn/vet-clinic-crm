import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { petApi } from '../../../../entities/pet';
import { PetSpecies } from '../../../../entities/pet';
import { useErrorHandler } from '../../../../shared/utils/errorHandler';

interface CreatePetFormValues {
    name: string;
    species: PetSpecies;
    breed: string;
    age: string; // YYYY-MM date string
    weight: string; // Пока игнорируем или сохраним в notes, если бэк не поддерживает
}

export const useCreatePet = () => {
    const navigate = useNavigate();
    const { extractError } = useErrorHandler();
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
                // Validate format YYYY-MM
                if (/^\d{4}-\d{2}$/.test(values.age)) {
                    birthDate = `${values.age}-01`;
                } else {
                    // Fallback or error if browser didn't enforce type="month"
                    console.warn("Invalid date format from input:", values.age);
                    // Try to catch common "MM/YYYY" or "MM-YYYY" if needed, but for now just fail safe?
                    // Let's trying to parse if it is standard date string?
                    // Actually, if regex fails, maybe it's full date?
                    const dateObj = new Date(values.age);
                    if (!isNaN(dateObj.getTime())) {
                        birthDate = dateObj.toISOString().split('T')[0];
                    } else {
                        throw new Error("Invalid date format. Please use YYYY-MM.");
                    }
                }
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
            setError(extractError(err));
        } finally {
            setIsLoading(false);
        }
    };

    return { createPet, isLoading, error };
};