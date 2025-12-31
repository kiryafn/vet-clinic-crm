import { Header } from '../../widgets/Header/Header';
import { CreatePetForm } from '../../features/pet/create';

export const AddPetPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
            <Header />
            <div className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
                {/* Вставляем фичу */}
                <CreatePetForm />
            </div>
        </div>
    );
};