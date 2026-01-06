import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next'; // Assuming translation might be needed later
import { Header } from '../../widgets/Header/Header';
import { api } from '../../shared/api/api';
import { Card, Button, Alert } from '../../shared/ui';
import type { Client } from '../../entities/client/model/types';

export const ManageClientsPage = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchClients = async () => {
        setIsLoading(true);
        try {
            const res = await api.get<Client[]>('/clients/');
            setClients(res.data);
        } catch (e) {
            console.error(e);
            setError('Failed to fetch clients');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this client?')) return;
        try {
            await api.delete(`/clients/${id}`);
            setClients(prev => prev.filter(c => c.id !== id));
        } catch (e) {
            console.error(e);
            alert('Failed to delete client');
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
                    <h1 className="text-3xl font-bold text-gray-900">Manage Clients</h1>
                    <Button onClick={fetchClients} variant="outline">Refresh</Button>
                </div>

                {error && <Alert variant="error" title="Error">{error}</Alert>}

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
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
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
                                                        onClick={() => alert('Edit coming soon!')}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs px-3 py-1"
                                                        onClick={() => handleDelete(client.id)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {clients.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                No clients found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
