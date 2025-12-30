import { useEffect, useState } from 'react';
import { Header } from '../../widgets/Header/Header';
import { api } from '../../shared/api/api';
import { Card } from '../../shared/ui';

interface Pet {
    id: number;
    name: string;
    species: string;
    breed: string | null;
    birth_date: string | null;
    notes: string | null;
    age?: {
        years: number;
        months: number;
    };
}

export const MyPetsPage = () => {
    const [pets, setPets] = useState<Pet[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
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
        fetchPets();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Header />
            <div className="container mx-auto px-4 py-8 pt-24">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">My Pets</h1>
                </div>

                {isLoading ? (
                    <div className="text-center py-12">Loading your pets...</div>
                ) : (
                    <Card className="overflow-hidden p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-100 border-b">
                                    <tr>
                                        <th className="px-6 py-4 font-bold text-gray-700">Name</th>
                                        <th className="px-6 py-4 font-bold text-gray-700">Species</th>
                                        <th className="px-6 py-4 font-bold text-gray-700">Breed</th>
                                        <th className="px-6 py-4 font-bold text-gray-700">Age</th>
                                        <th className="px-6 py-4 font-bold text-gray-700">Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pets.map((pet) => (
                                        <tr key={pet.id} className="border-b hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">{pet.name}</td>
                                            <td className="px-6 py-4 text-gray-600">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${pet.species.toLowerCase() === 'dog' ? 'bg-blue-100 text-blue-700' :
                                                        pet.species.toLowerCase() === 'cat' ? 'bg-pink-100 text-pink-700' :
                                                            'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {pet.species}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{pet.breed || '-'}</td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {pet.age ? `${pet.age.years}y ${pet.age.months}m` : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                                {pet.notes || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                    {pets.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                                                You haven't added any pets yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};
