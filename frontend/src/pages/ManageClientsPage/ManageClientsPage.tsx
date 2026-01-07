import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Header } from '../../widgets/Header/Header';
import { EditClientForm } from '../../widgets/EditClientForm/EditClientForm';
import { api } from '../../shared/api/api';
import { Button, Alert } from '../../shared/ui';
import { Modal } from '../../shared/ui/Modal/Modal';
import type { Client } from '../../entities/client/model/types';

export const ManageClientsPage = () => {
    const { t } = useTranslation();
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingClient, setEditingClient] = useState<Client | null>(null);

    const fetchClients = async () => {
        setIsLoading(true);
        try {
            const res = await api.get<Client[]>('/clients/');
            setClients(res.data);
        } catch (e) {
            console.error(e);
            setError(t('clients.errors.fetch_failed'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm(t('clients.delete_confirm'))) return;
        try {
            await api.delete(`/clients/${id}`);
            setClients(prev => prev.filter(c => c.id !== id));
        } catch (e) {
            console.error(e);
            alert(t('clients.delete_failed'));
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Header />
            <div className="container mx-auto px-4 py-8 pt-24">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">{t('clients.manage_title')}</h1>
                    <Button onClick={fetchClients} variant="outline">{t('clients.refresh')}</Button>
                </div>

                {error && <Alert variant="error" title={t('common.error')}>{error}</Alert>}

                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('clients.id')}</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('clients.full_name')}</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('clients.phone')}</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('clients.address')}</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">{t('clients.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {clients.map((client) => (
                                        <tr key={client.id} className="group hover:bg-gray-50/50 transition-all">
                                            <td className="px-6 py-4 text-sm text-gray-500">#{client.id}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{client.full_name}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{client.phone_number}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{client.address || '-'}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        className="text-xs px-3 py-1 bg-white border border-gray-200 hover:bg-gray-50"
                                                        onClick={() => setEditingClient(client)}
                                                    >
                                                        {t('clients.edit')}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs px-3 py-1"
                                                        onClick={() => handleDelete(client.id)}
                                                    >
                                                        {t('clients.delete')}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {clients.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                {t('clients.empty')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Client Modal */}
            {editingClient && (
                <Modal
                    isOpen={!!editingClient}
                    onClose={() => setEditingClient(null)}
                >
                    <EditClientForm
                        client={editingClient}
                        onSuccess={() => {
                            setEditingClient(null);
                            fetchClients();
                        }}
                        onCancel={() => setEditingClient(null)}
                    />
                </Modal>
            )}
        </div>
    );
};
