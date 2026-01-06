import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '../../../../shared/ui';
import { PetSpecies } from '../../../../entities/pet';
import { useCreatePet } from '../model/useCreatePet';

export const CreatePetForm = () => {
    const navigate = useNavigate();
    const { createPet, isLoading, error } = useCreatePet();

    // Локальный стейт формы (UI state)
    const [name, setName] = useState('');
    const [species, setSpecies] = useState<PetSpecies>(PetSpecies.DOG);
    const [breed, setBreed] = useState('');
    const [age, setAge] = useState('');
    const [weight, setWeight] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        createPet({ name, species, breed, age, weight });
    };

    return (
        <Card title="Add New Pet" className="w-full max-w-lg">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                    label="Pet Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Buddy"
                />

                <div className="input-wrapper">
                    <label className="input-label">Pet Type</label>
                    <select
                        value={species}
                        onChange={(e) => setSpecies(e.target.value as PetSpecies)}
                        className="input"
                    >
                        <option value={PetSpecies.DOG}>Dog</option>
                        <option value={PetSpecies.CAT}>Cat</option>
                        <option value={PetSpecies.BIRD}>Bird</option>
                        <option value={PetSpecies.OTHER}>Other</option>
                    </select>
                </div>

                <Input
                    label="Breed"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    placeholder="e.g. Golden Retriever"
                />

                <div className="flex gap-4">
                    <Input
                        label="Date of Birth (Month/Year)"
                        type="month"
                        value={age} // We reuse 'age' state variable for date string to minimize refactor, or should rename? Let's rename in next step if confusing. 
                        // Actually better to keep simple now. 
                        onChange={(e) => setAge(e.target.value)}
                        className="w-full"
                        required
                    />
                    <Input
                        label="Weight (kg)"
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full"
                    />
                </div>

                {error && <div className="text-red-500 text-sm">{error}</div>}

                <div className="flex gap-3 mt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/')}
                        className="w-full"
                    >
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isLoading} className="w-full">
                        Add Pet
                    </Button>
                </div>
            </form>
        </Card>
    );
};