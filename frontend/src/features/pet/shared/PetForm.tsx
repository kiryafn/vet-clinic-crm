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

    // Reset when initialValues change
    useEffect(() => {
        if (initialValues) {
            setName(initialValues.name);
            setSpecies(initialValues.species as PetSpecies);
            setBreed(initialValues.breed || '');
            // Format age date for input if full date is provided
            if (initialValues.age && initialValues.age.length > 7) {
                setAge(initialValues.age.substring(0, 7)); // YYYY-MM
            } else {
                setAge(initialValues.age || '');
            }
            setWeight(initialValues.weight || '');
        }
    }, [initialValues]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit({ name, species, breed, age, weight });
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
                label={t('pet.form.name')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder={t('pet.form.placeholder_name')}
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
                onChange={(e) => setBreed(e.target.value)}
                placeholder={t('pet.form.placeholder_breed')}
            />

            <div className="flex gap-4">
                <Input
                    label={t('pet.form.birth_date')}
                    type="month"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full"
                    required
                />
                <Input
                    label={t('pet.form.weight')}
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full"
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
