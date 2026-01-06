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
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (pets.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                <div className="text-6xl mb-4">🐾</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No pets added yet</h3>
                <p className="text-gray-500">Add your first pet to get started!</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pet Profile</th>
                            <th className="px-6 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Species</th>
                            <th className="px-6 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Breed</th>
                            <th className="px-6 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Age</th>
                            <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
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
        </div>
    );
};