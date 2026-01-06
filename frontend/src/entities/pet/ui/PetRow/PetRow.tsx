import type { Pet } from '../../model/types';
import clsx from 'clsx';

interface PetRowProps {
    pet: Pet;
    onDelete: () => void;
    onUpdate: () => void;
}

export const PetRow = ({ pet, onDelete, onUpdate }: PetRowProps) => {
    const badgeColor =
        pet.species.toLowerCase() === 'dog' ? 'bg-blue-100 text-blue-700' :
            pet.species.toLowerCase() === 'cat' ? 'bg-pink-100 text-pink-700' :
                'bg-gray-100 text-gray-700';

    return (
        <tr className="border-b hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 font-medium text-gray-900">{pet.name}</td>
            <td className="px-6 py-4 text-gray-600">
                <span className={clsx('px-2 py-1 rounded-full text-xs font-semibold', badgeColor)}>
                    {pet.species}
                </span>
            </td>
            <td className="px-6 py-4 text-gray-600">{pet.breed || '-'}</td>
            <td className="px-6 py-4 text-gray-600">
                {pet.age ? `${pet.age.years}y ${pet.age.months}m` : '-'}
            </td>
            <td className="px-6 py-4 text-right space-x-2">
                <button
                    onClick={onUpdate}
                    className="text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors"
                >
                    Update
                </button>
                <button
                    onClick={onDelete}
                    className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors"
                >
                    Delete
                </button>
            </td>
        </tr>
    );
};