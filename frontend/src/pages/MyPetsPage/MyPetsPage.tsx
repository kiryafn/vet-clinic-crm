import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../widgets/Header/Header';
import { api } from '../../shared/api/api';
import type { Pet } from '../../entities/pet/model/types';
import { PetList } from '../../entities/pet/ui/PetList/PetList';
import { Button } from '../../shared/ui';
import { Modal } from '../../shared/ui/Modal/Modal';
import { PetForm } from '../../features/pet/shared/PetForm';
import { petApi } from '../../entities/pet/api/petApi';

export const MyPetsPage = () => {
    const [pets, setPets] = useState<Pet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingPet, setEditingPet] = useState<Pet | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const navigate = useNavigate();

    const fetchPets = async () => {
        try {
            const res = await api.get('/pets/');
            setPets(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPets();
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this pet?')) return;
        try {
            await petApi.delete(id);
            setPets(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error("Failed to delete pet", err);
            alert("Failed to delete pet");
        }
    };

    const handleUpdate = async (values: any) => {
        if (!editingPet) return;
        setIsUpdating(true);
        try {
            let birthDate = null;
            if (values.age) {
                if (/^\d{4}-\d{2}$/.test(values.age)) {
                    birthDate = `${values.age}-01`;
                } else if (/^\d{4}-\d{2}-\d{2}$/.test(values.age)) {
                    // Already full date (e.g. from backend)
                    birthDate = values.age;
                } else {
                    // Try parse generic
                    const d = new Date(values.age);
                    if (!isNaN(d.getTime())) birthDate = d.toISOString().split('T')[0];
                }
            }

            const updatedPet = await petApi.update(editingPet.id, {
                ...values,
                birth_date: birthDate
            });

            setPets(prev => prev.map(p => p.id === updatedPet.id ? updatedPet : p));
            setEditingPet(null);
        } catch (error) {
            console.error("Failed to update pet", error);
            alert("Failed to update pet");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Header />
            <div className="container mx-auto px-4 py-8 pt-24">
                <div className="mb-6 flex justify-between items-center">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/')}
                        className="gap-2 text-gray-600 hover:text-gray-900"
                    >
                        ← Back to Home
                    </Button>
                    <Button
                        onClick={() => navigate('/add-pet')}
                        className="shadow-lg shadow-indigo-500/20"
                    >
                        + Add New Pet
                    </Button>
                </div>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Pets</h1>
                    <p className="text-gray-500 mt-2">Manage your furry friends profile and details</p>
                </div>

                <PetList
                    pets={pets}
                    isLoading={isLoading}
                    onDelete={handleDelete}
                    onUpdate={(id) => {
                        const pet = pets.find(p => p.id === id);
                        if (pet) setEditingPet(pet);
                    }}
                />

                <Modal
                    isOpen={!!editingPet}
                    onClose={() => setEditingPet(null)}
                    title="Edit Pet"
                >
                    {editingPet && (
                        <PetForm
                            initialValues={{
                                name: editingPet.name,
                                species: typeof editingPet.species === 'string' ? editingPet.species : 'DOG',
                                breed: editingPet.breed || '',
                                age: editingPet.birth_date || '',
                                weight: '' // We don't have weight in Pet model yet
                            }}
                            onSubmit={handleUpdate}
                            isLoading={isUpdating}
                            submitLabel="Save Changes"
                            onCancel={() => setEditingPet(null)}
                        />
                    )}
                </Modal>
            </div>
        </div>
    );
};