import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { petApi } from '../../../../entities/pet';
import { PetSpecies } from '../../../../entities/pet';
import { useErrorHandler } from '../../../../shared/utils/errorHandler';

interface CreatePetFormValues {
    name: string;
    species: PetSpecies;
    breed: string;
    age: string;
    weight: string;
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
            let birthDate = null;
            if (values.age) {
                // Validate format YYYY-MM
                if (/^\d{4}-\d{2}$/.test(values.age)) {
                    birthDate = `${values.age}-01`;
                } else {
                    console.warn("Invalid date format from input:", values.age);

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
                weight: values.weight ? parseFloat(values.weight) : null,
            });

            navigate('/');
        } catch (err: any) {
            setError(extractError(err));
        } finally {
            setIsLoading(false);
        }
    };

    return { createPet, isLoading, error };
};