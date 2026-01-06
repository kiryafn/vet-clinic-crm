import { useEffect, useState } from 'react';
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

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {clients.map(client => (
                            <Card key={client.id} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-lg text-gray-900">{client.full_name}</h3>
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">ID: {client.id}</span>
                                    </div>
                                    <div className="text-gray-500 text-sm mt-1">
                                        📞 {client.phone_number} | 📍 {client.address || 'No address'}
                                    </div>
                                </div>
                                <div className="flex gap-2 w-full md:w-auto">
                                    <Button
                                        variant="ghost"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleDelete(client.id)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </Card>
                        ))}
                        {clients.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                                <h3 className="text-xl font-semibold text-gray-900">No clients found</h3>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
