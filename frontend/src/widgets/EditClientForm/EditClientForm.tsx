import { useState, useEffect, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../shared/api/api';
import { Button, Input, Card } from '../../shared/ui';
import { useErrorHandler } from '../../shared/utils/errorHandler';

interface Client {
    id: number;
    full_name: string;
    phone_number: string;
    address?: string;
    email?: string;
}

interface EditClientFormProps {
    client: Client;
    onSuccess: () => void;
    onCancel: () => void;
}

export const EditClientForm = ({ client, onSuccess, onCancel }: EditClientFormProps) => {
    const { t } = useTranslation();
    const { extractError } = useErrorHandler();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [fullName, setFullName] = useState(client.full_name);
    const [phoneNumber, setPhoneNumber] = useState(client.phone_number);
    const [address, setAddress] = useState(client.address || '');

    useEffect(() => {
        setFullName(client.full_name);
        setPhoneNumber(client.phone_number);
        setAddress(client.address || '');
    }, [client]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await api.patch(`/clients/${client.id}`, {
                full_name: fullName,
                phone_number: phoneNumber,
                address: address || null,
            });
            onSuccess();
        } catch (err: any) {
            setError(extractError(err));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card title={t('clients.edit_title', 'Edit Client')}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input 
                    label={t('clients.full_name')} 
                    value={fullName} 
                    onChange={e => setFullName(e.target.value)} 
                    required 
                />
                {client.email && (
                    <Input 
                        label={t('auth.register.email')} 
                        value={client.email} 
                        disabled
                        className="bg-gray-100"
                    />
                )}
                <Input 
                    label={t('clients.phone')} 
                    type="tel" 
                    value={phoneNumber} 
                    onChange={e => setPhoneNumber(e.target.value)} 
                    required 
                />
                <Input 
                    label={t('auth.register.address')} 
                    value={address} 
                    onChange={e => setAddress(e.target.value)} 
                />

                {error && (
                    <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm whitespace-pre-line">
                        {error}
                    </div>
                )}

                <div className="flex gap-3 mt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        className="flex-1"
                    >
                        {t('pet.form.cancel')}
                    </Button>
                    <Button type="submit" isLoading={isLoading} className="flex-1">
                        {t('pet.form.save')}
                    </Button>
                </div>
            </form>
        </Card>
    );
};
