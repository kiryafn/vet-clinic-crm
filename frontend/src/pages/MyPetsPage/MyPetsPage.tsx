import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Добавил хук для переводов
import { Header } from '../../widgets/Header/Header';
import type { Pet } from '../../entities/pet/model/types';
import { PetList } from '../../entities/pet/ui/PetList/PetList';
import { Button } from '../../shared/ui';
import { Modal } from '../../shared/ui/Modal/Modal';
import { PetForm } from '../../features/pet/shared/PetForm'; // Убедись, что путь верный
import { petApi } from '../../entities/pet/api/petApi';

export const MyPetsPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // State
    const [pets, setPets] = useState<Pet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingPet, setEditingPet] = useState<Pet | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // Pagination State
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 5; // Лимит: 5 животных на страницу

    const fetchPets = useCallback(async () => {
        setIsLoading(true);
        try {
            // Используем метод getAll из petApi, который теперь поддерживает пагинацию
            const data = await petApi.getAll(page, limit);
            setPets(data.items);
            setTotal(data.total);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchPets();
    }, [fetchPets]);

    const handleDelete = async (id: number) => {
        if (!window.confirm(t('pet.messages.delete_confirm'))) return;
        try {
            await petApi.delete(id);

            // Если удалили последний элемент на странице и это не первая страница - идем назад
            if (pets.length === 1 && page > 1) {
                setPage(p => p - 1);
            } else {
                fetchPets(); // Иначе просто обновляем текущую
            }
        } catch (error) {
            console.error(error);
            alert(t('pet.messages.delete_fail'));
        }
    };

    const handleUpdate = async (data: any) => {
        if (!editingPet) return;
        setIsUpdating(true);
        try {
            await petApi.update(editingPet.id, data);
            setEditingPet(null);
            fetchPets(); // Обновляем список, чтобы увидеть изменения
        } catch (error) {
            console.error(error);
            alert(t('pet.messages.update_fail'));
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Header />
            <div className="container mx-auto px-4 py-8 pt-24">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{t('pet.list_title')}</h1>
                        <p className="text-gray-500 mt-2">{t('pet.list_subtitle')}</p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => navigate('/')}
                        >
                            {t('pet.back_home')}
                        </Button>
                        <Button
                            onClick={() => navigate('/add-pet')}
                            className="shadow-lg shadow-indigo-500/20"
                        >
                            + {t('pet.add_new')}
                        </Button>
                    </div>
                </div>

                <PetList
                    pets={pets}
                    isLoading={isLoading}
                    onDelete={handleDelete}
                    onUpdate={(id) => {
                        const pet = pets.find(p => p.id === id);
                        if (pet) setEditingPet(pet);
                    }}
                    // Передаем пропсы пагинации
                    page={page}
                    total={total}
                    limit={limit}
                    onPageChange={setPage}
                />

                <Modal
                    isOpen={!!editingPet}
                    onClose={() => setEditingPet(null)}
                    title={t('pet.form.title_edit')}
                >
                    {editingPet && (
                        <PetForm
                            initialValues={{
                                name: editingPet.name,
                                species: typeof editingPet.species === 'string' ? editingPet.species : 'DOG',
                                breed: editingPet.breed || '',
                                birth_date: editingPet.birth_date || '', // birth_date для формы
                                weight: ''
                            }}
                            onSubmit={handleUpdate}
                            isLoading={isUpdating}
                            submitLabel={t('pet.form.save')}
                            onCancel={() => setEditingPet(null)}
                        />
                    )}
                </Modal>
            </div>
        </div>
    );
};