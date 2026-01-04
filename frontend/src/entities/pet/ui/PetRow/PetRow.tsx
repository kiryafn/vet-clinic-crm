import type {Pet} from '../../model/types';
import clsx from 'clsx';

interface PetRowProps {
    pet: Pet;
}

export const PetRow = ({ pet }: PetRowProps) => {
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
            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                {pet.notes || '-'}
            </td>
        </tr>
    );
};