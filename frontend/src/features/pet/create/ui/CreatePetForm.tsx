import { useNavigate } from 'react-router-dom';
import { Card } from '../../../../shared/ui';
import { useCreatePet } from '../model/useCreatePet';
import { PetForm } from '../../shared/PetForm';

export const CreatePetForm = () => {
    const navigate = useNavigate();
    const { createPet, isLoading, error } = useCreatePet();

    return (
        <Card title="Add New Pet" className="w-full max-w-lg">
            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

            <PetForm
                onSubmit={createPet}
                isLoading={isLoading}
                submitLabel="Add Pet"
                onCancel={() => navigate('/')}
            />
        </Card>
    );
};