import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../widgets/Header/Header';
import { Button, Input, Card } from '../../shared/ui';
// We will need a service to create pet. For now assuming axios or similar.
// Since I haven't checked api layer for pets, I'll assume I can use an axios instance directly or create a service.
// Checking backend, POST /pets takes {name, type, ...}
import { api } from '../../shared/api/api';

export const AddPetPage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [name, setName] = useState('');
    const [type, setType] = useState('DOG'); // Enum: DOG, CAT, BIRD, OTHER
    const [breed, setBreed] = useState('');
    const [age, setAge] = useState('');
    const [weight, setWeight] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await api.post('/pets/', {
                name,
                type,
                breed: breed || null,
                age: age ? parseInt(age) : null,
                weight: weight ? parseFloat(weight) : null
            });
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to add pet');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
            <Header />
            <div className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
                <Card title="Add New Pet" className="w-full max-w-lg">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <Input
                            label="Pet Name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            placeholder="e.g. Buddy"
                        />

                        <div className="input-wrapper">
                            <label className="input-label">Pet Type</label>
                            <select
                                value={type}
                                onChange={e => setType(e.target.value)}
                                className="input"
                            >
                                <option value="DOG">Dog</option>
                                <option value="CAT">Cat</option>
                                <option value="BIRD">Bird</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>

                        <Input
                            label="Breed"
                            value={breed}
                            onChange={e => setBreed(e.target.value)}
                            placeholder="e.g. Golden Retriever"
                        />

                        <div className="flex gap-4">
                            <Input
                                label="Age (years)"
                                type="number"
                                value={age}
                                onChange={e => setAge(e.target.value)}
                                className="w-full"
                            />
                            <Input
                                label="Weight (kg)"
                                type="number"
                                value={weight}
                                onChange={e => setWeight(e.target.value)}
                                className="w-full"
                            />
                        </div>

                        {error && <div className="text-red-500 text-sm">{error}</div>}

                        <div className="flex gap-3 mt-4">
                            <Button type="button" variant="outline" onClick={() => navigate('/')} className="w-full">
                                Cancel
                            </Button>
                            <Button type="submit" isLoading={isLoading} className="w-full">
                                Add Pet
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};
