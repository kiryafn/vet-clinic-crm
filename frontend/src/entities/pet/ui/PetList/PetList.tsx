import type { Pet } from '../../model/types';
import { PetRow } from '../PetRow/PetRow';
import { Card } from '../../../../shared/ui';

interface PetListProps {
    pets: Pet[];
    isLoading: boolean;
    onDelete: (id: number) => void;
    onUpdate: (id: number) => void;
}

export const PetList = ({ pets, isLoading, onDelete, onUpdate }: PetListProps) => {
    if (isLoading) {
        return <div className="text-center py-12 text-gray-500">Loading your pets...</div>;
    }

    if (pets.length === 0) {
        return (
            <Card className="text-center py-12 text-gray-500 italic">
                You haven't added any pets yet.
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="px-6 py-4 font-bold text-gray-700">Name</th>
                            <th className="px-6 py-4 font-bold text-gray-700">Species</th>
                            <th className="px-6 py-4 font-bold text-gray-700">Breed</th>
                            <th className="px-6 py-4 font-bold text-gray-700">Age</th>
                            <th className="px-6 py-4 font-bold text-gray-700 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pets.map((pet) => (
                            <PetRow
                                key={pet.id}
                                pet={pet}
                                onDelete={() => onDelete(pet.id)}
                                onUpdate={() => onUpdate(pet.id)}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};