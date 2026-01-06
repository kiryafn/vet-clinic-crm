import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from '../../../../shared/ui';
import { useCreatePet } from '../model/useCreatePet';
import { PetForm } from '../../shared/PetForm';

export const CreatePetForm = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { createPet, isLoading, error } = useCreatePet();

    return (
        <Card title={t('pet.form.title_add')} className="w-full max-w-lg">
            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

            <PetForm
                onSubmit={createPet}
                isLoading={isLoading}
                submitLabel={t('pet.form.add')}
                onCancel={() => navigate('/')}
            />
        </Card>
    );
};