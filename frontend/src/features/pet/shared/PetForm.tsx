import { type FormEvent, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '../../../shared/ui';
import { PetSpecies } from '../../../entities/pet';

interface PetFormProps {
    initialValues?: {
        name: string;
        species: PetSpecies | string;
        breed: string;
        age: string; // YYYY-MM or YYYY-MM-DD
        weight: string;
    };
    onSubmit: (values: {
        name: string;
        species: PetSpecies;
        breed: string;
        age: string;
        weight: string;
    }) => void;
    isLoading?: boolean;
    submitLabel?: string;
    onCancel?: () => void;
}

export const PetForm = ({ initialValues, onSubmit, isLoading, submitLabel, onCancel }: PetFormProps) => {
    const { t } = useTranslation();
    const [name, setName] = useState(initialValues?.name || '');
    const [species, setSpecies] = useState<PetSpecies>(initialValues?.species as PetSpecies || PetSpecies.DOG);
    const [breed, setBreed] = useState(initialValues?.breed || '');
    const [age, setAge] = useState(initialValues?.age || '');
    const [weight, setWeight] = useState(initialValues?.weight || '');

    // Validation errors
    const [errors, setErrors] = useState<{
        name?: string;
        breed?: string;
        age?: string;
        weight?: string;
    }>({});

    // Reset when initialValues change
    useEffect(() => {
        if (initialValues) {
            setName(initialValues.name);
            setSpecies(initialValues.species as PetSpecies);
            setBreed(initialValues.breed || '');
            if (initialValues.age && initialValues.age.length > 7) {
                setAge(initialValues.age.substring(0, 7));
            } else {
                setAge(initialValues.age || '');
            }
            setWeight(initialValues.weight || '');
            setErrors({});
        }
    }, [initialValues]);

    const validate = (): boolean => {
        const newErrors: typeof errors = {};

        // Name validation
        const trimmedName = name.trim();
        if (!trimmedName) {
            newErrors.name = t('pet.validation.name_required', 'Name is required');
        } else if (trimmedName.length < 1) {
            newErrors.name = t('pet.validation.name_min', 'Name must be at least 1 character');
        } else if (trimmedName.length > 50) {
            newErrors.name = t('pet.validation.name_max', 'Name cannot exceed 50 characters');
        }

        // Breed validation
        if (breed && breed.trim().length > 50) {
            newErrors.breed = t('pet.validation.breed_max', 'Breed cannot exceed 50 characters');
        }

        // Birth date validation
        if (!age) {
            newErrors.age = t('pet.validation.birth_date_required', 'Birth date is required');
        } else {
            // Проверка формата YYYY-MM
            const dateRegex = /^\d{4}-\d{2}$/;
            if (!dateRegex.test(age)) {
                newErrors.age = t('pet.validation.invalid_date_format', 'Invalid date format. Please use YYYY-MM format.');
            } else {
                const parts = age.split('-');
                const year = parseInt(parts[0]);
                const month = parseInt(parts[1]);
                
                // Проверка месяца
                if (month < 1 || month > 12) {
                    newErrors.age = t('pet.validation.invalid_month', 'Invalid month. Month must be between 1 and 12.');
                } else {
                    // Проверка: год не должен быть меньше 1970
                    if (year < 1970) {
                        newErrors.age = t('pet.validation.birth_year_min', 'Birth year cannot be earlier than 1970');
                    } else {
                        // Проверка на будущую дату
                        try {
                            const selectedDate = new Date(age + '-01');
                            if (isNaN(selectedDate.getTime())) {
                                newErrors.age = t('pet.validation.invalid_date_format', 'Invalid date format. Please use YYYY-MM format.');
                            } else {
                                const today = new Date();
                                today.setHours(23, 59, 59, 999);
                                
                                if (selectedDate > today) {
                                    newErrors.age = t('pet.validation.birth_date_future', 'Birth date cannot be in the future');
                                }
                            }
                        } catch (e) {
                            newErrors.age = t('pet.validation.invalid_date_format', 'Invalid date format. Please use YYYY-MM format.');
                        }
                    }
                }
            }
        }

        // Weight validation
        if (weight) {
            const weightNum = parseFloat(weight);
            if (isNaN(weightNum) || weightNum < 0) {
                newErrors.weight = t('pet.validation.weight_positive', 'Weight must be a positive number');
            } else if (weightNum > 1000) {
                newErrors.weight = t('pet.validation.weight_max', 'Weight cannot exceed 1000 kg');
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        onSubmit({ name: name.trim(), species, breed: breed.trim() || '', age, weight });
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
                label={t('pet.form.name')}
                value={name}
                onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                error={errors.name}
                required
                placeholder={t('pet.form.placeholder_name')}
                maxLength={50}
            />

            <div className="input-wrapper">
                <label className="input-label block text-sm font-medium text-gray-700 mb-1">{t('pet.form.type')}</label>
                <select
                    value={species}
                    onChange={(e) => setSpecies(e.target.value as PetSpecies)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                >
                    {Object.values(PetSpecies).map((s) => (
                        <option key={s} value={s}>{t(`pet.species.${s.toLowerCase()}`, s.charAt(0) + s.slice(1).toLowerCase())}</option>
                    ))}
                </select>
            </div>

            <Input
                label={t('pet.form.breed')}
                value={breed}
                onChange={(e) => {
                    setBreed(e.target.value);
                    if (errors.breed) setErrors({ ...errors, breed: undefined });
                }}
                error={errors.breed}
                placeholder={t('pet.form.placeholder_breed')}
                maxLength={50}
            />

            <div className="flex gap-4">
                <Input
                    label={t('pet.form.birth_date')}
                    type="month"
                    value={age}
                    onChange={(e) => {
                        setAge(e.target.value);
                        if (errors.age) setErrors({ ...errors, age: undefined });
                    }}
                    error={errors.age}
                    className="w-full"
                    required
                    min="1970-01"
                    max={new Date().toISOString().slice(0, 7)}
                />
                <Input
                    label={t('pet.form.weight')}
                    type="number"
                    value={weight}
                    onChange={(e) => {
                        setWeight(e.target.value);
                        if (errors.weight) setErrors({ ...errors, weight: undefined });
                    }}
                    error={errors.weight}
                    className="w-full"
                    min="0"
                    max="1000"
                    step="0.1"
                    placeholder={t('pet.form.placeholder_weight', 'kg')}
                />
            </div>

            <div className="flex gap-3 mt-4 justify-end">
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                    >
                        {t('pet.form.cancel')}
                    </Button>
                )}
                <Button type="submit" isLoading={isLoading}>
                    {submitLabel || t('pet.form.save')}
                </Button>
            </div>
        </form>
    );
};
