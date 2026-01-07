import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Header } from '../../widgets/Header/Header';
import { CreateDoctorForm } from '../../widgets/CreateDoctorForm/CreateDoctorForm';
import { api } from '../../shared/api/api';
import { Card, Button } from '../../shared/ui';

export const ManageDoctorsPage = () => {
    const { t } = useTranslation();
    const [doctors, setDoctors] = useState<any[]>([]);

    const fetchDoctors = async () => {
        try {
            const res = await api.get('/doctors/');
            setDoctors(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Header />
            <div className="container mx-auto px-4 py-8 pt-24">
                <h1 className="text-3xl font-bold mb-8 text-gray-800">{t('doctors.manage_title')}</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <CreateDoctorForm onSuccess={fetchDoctors} />
                    </div>

                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold mb-4 text-gray-700">{t('doctors.list_title')}</h2>
                        <div className="grid gap-4">
                            {doctors.map(doc => (
                                <Card key={doc.id} className="flex justify-between items-center hover:shadow-md transition-shadow">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">{doc.full_name}</h3>
                                        {/* Display formatting for capitalization */}
                                        <p className="text-indigo-600 font-medium">
                                            {typeof doc.specialization === 'string'
                                                ? doc.specialization.charAt(0) + doc.specialization.slice(1).toLowerCase()
                                                : doc.specialization?.name || JSON.stringify(doc.specialization)}
                                        </p>
                                        <div className="flex gap-4 text-sm text-gray-500 mt-1">
                                            <span>⭐ {doc.experience_years} {t('doctors.years_exp')}</span>
                                            <span>💰 ${doc.price}</span>
                                        </div>
                                        {doc.bio && <p className="text-xs text-gray-400 mt-2 line-clamp-2">{doc.bio}</p>}
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-500">
                                            ID: {doc.id}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs px-3 py-1"
                                                onClick={async () => {
                                                    if (window.confirm(t('doctors.delete_confirm'))) {
                                                        try {
                                                            await api.delete(`/doctors/${doc.id}`);
                                                            fetchDoctors();
                                                        } catch (e) {
                                                            alert(t('doctors.delete_failed'));
                                                        }
                                                    }
                                                }}
                                            >
                                                {t('clients.delete')}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="text-xs px-3 py-1"
                                                onClick={() => alert(t('doctors.edit_coming_soon'))}
                                            >
                                                {t('clients.edit')}
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                            {doctors.length === 0 && (
                                <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-300 text-gray-500">
                                    {t('doctors.list_empty')}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
