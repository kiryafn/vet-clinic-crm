import { useTranslation } from 'react-i18next';
import type { Pet } from '../../model/types';
import { PetRow } from '../PetRow/PetRow';
import { Button } from '../../../../shared/ui'; // Проверь путь к Button

interface PetListProps {
    pets: Pet[];
    isLoading: boolean;
    onDelete: (id: number) => void;
    onUpdate: (id: number) => void;

    // Новые пропсы для пагинации
    page: number;
    total: number;
    limit: number;
    onPageChange: (newPage: number) => void;
}

export const PetList = ({
    pets,
    isLoading,
    onDelete,
    onUpdate,
    page,
    total,
    limit,
    onPageChange
}: PetListProps) => {
    const { t } = useTranslation();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <span className="ml-4 text-gray-500">{t('pet.loading')}</span>
            </div>
        );
    }

    // Показываем "Нет животных" только если это первая страница и список пуст
    if (pets.length === 0 && page === 1) {
        return (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                <div className="text-6xl mb-4">🐾</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('pet.no_pets_title')}</h3>
                <p className="text-gray-500">{t('pet.no_pets_desc')}</p>
            </div>
        );
    }

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('pet.table.profile')}</th>
                                <th className="px-6 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('pet.table.species')}</th>
                                <th className="px-6 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('pet.table.breed')}</th>
                                <th className="px-6 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('pet.table.age')}</th>
                                <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">{t('pet.table.actions')}</th>
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

            {/* Контролы пагинации */}
            {total > 0 && (
                <div className="flex justify-center items-center gap-4">
                    <Button
                        variant="outline"
                        disabled={page === 1}
                        onClick={() => onPageChange(page - 1)}
                        className="!py-2 !px-4 text-sm"
                    >
                        ← Prev
                    </Button>
                    <span className="text-gray-600 font-medium text-sm">
                        Page {page} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        disabled={page >= totalPages}
                        onClick={() => onPageChange(page + 1)}
                        className="!py-2 !px-4 text-sm"
                    >
                        Next →
                    </Button>
                </div>
            )}
        </div>
    );
};