import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <--- 1. Импортируем хук навигации
import { Header } from '../../widgets/Header/Header';
import { api } from '../../shared/api/api';
// Обрати внимание: проверь правильность пути к типу Pet, возможно он в entities/pet/model/types
import type { Pet } from '../../entities/pet/model/types';
import { PetList } from '../../entities/pet/ui/PetList/PetList';
import { Button } from '../../shared/ui'; // <--- 2. Импортируем твою кнопку

export const MyPetsPage = () => {
    const [pets, setPets] = useState<Pet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate(); // <--- 3. Инициализируем хук

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

                {/* 4. Добавляем блок с кнопкой "Назад" */}
                <div className="mb-6">
                    <Button
                        variant="outline" // Используем outline, чтобы не отвлекать от главного
                        onClick={() => navigate('/')} // Возврат на главную
                        className="gap-2" // Отступ между стрелочкой и текстом
                    >
                        ← Back to Home
                    </Button>
                </div>

                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">My Pets</h1>
                    {/* Место для кнопки AddPetButton */}
                </div>

                <PetList pets={pets} isLoading={isLoading} />
            </div>
        </div>
    );
};