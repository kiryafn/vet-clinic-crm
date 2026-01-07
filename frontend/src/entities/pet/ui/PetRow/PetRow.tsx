import { useTranslation } from 'react-i18next';
import type { Pet } from '../../model/types';

interface PetRowProps {
    pet: Pet;
    onDelete: () => void;
    onUpdate: () => void;
}

export const PetRow = ({ pet, onDelete, onUpdate }: PetRowProps) => {
    const { t } = useTranslation();

    const getSpeciesIcon = (species: string) => {
        const s = species.toLowerCase();
        if (s === 'dog') return '🐶';
        if (s === 'cat') return '🐱';
        if (s === 'bird') return '🐦';
        if (s === 'fish') return '🐠';
        if (s === 'rabbit') return '🐰';
        return '🐾';
    };

    const themeColors: Record<string, string> = {
        dog: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
        cat: 'bg-rose-50 text-rose-700 ring-rose-600/20',
        bird: 'bg-sky-50 text-sky-700 ring-sky-600/20',
        default: 'bg-gray-50 text-gray-700 ring-gray-600/20'
    };

    const speciesLower = typeof pet.species === 'string' ? pet.species.toLowerCase() : 'other';
    const badgeClass = themeColors[speciesLower] || themeColors.default;

    return (
        <tr className="group hover:bg-gray-50/50 transition-all duration-200">
            <td className="px-8 py-5">
                <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 flex items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200 text-lg`}>
                        {getSpeciesIcon(speciesLower)}
                    </div>
                    <div>
                        <div className="font-bold text-gray-900">{pet.name}</div>
                        <div className="text-xs text-gray-400">ID: #{pet.id}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-5">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${badgeClass}`}>
                    {t(`pet.species.${speciesLower}`, pet.species as string)}
                </span>
            </td>
            <td className="px-6 py-5 text-sm text-gray-600 font-medium">
                {pet.breed || <span className="text-gray-400 italic">{t('pet.table.unknown')}</span>}
            </td>
            <td className="px-6 py-5 text-sm text-gray-600 font-medium">
                {pet.age ? (
                    <span>
                        <span className="text-gray-900 font-bold">{pet.age.years}</span> {t('pet.table.yrs')}{' '}
                        <span className="text-gray-500">{pet.age.months} {t('pet.table.mos')}</span>
                    </span>
                ) : (
                    <span className="text-gray-400">-</span>
                )}
            </td>
            <td className="px-8 py-5 text-right">
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={onUpdate}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Edit"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    );
};