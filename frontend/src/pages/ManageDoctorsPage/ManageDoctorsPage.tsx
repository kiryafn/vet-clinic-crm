import { useEffect, useState } from 'react';
import { Header } from '../../widgets/Header/Header';
import { CreateDoctorForm } from '../../widgets/CreateDoctorForm/CreateDoctorForm';
import { api } from '../../shared/api/api';
import { Card } from '../../shared/ui';

export const ManageDoctorsPage = () => {
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
                <h1 className="text-3xl font-bold mb-8 text-gray-800">Manage Doctors</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <CreateDoctorForm onSuccess={fetchDoctors} />
                    </div>

                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold mb-4 text-gray-700">Doctor List</h2>
                        <div className="grid gap-4">
                            {doctors.map(doc => (
                                <Card key={doc.id} className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-lg">{doc.user.full_name}</h3>
                                        <p className="text-gray-600">{doc.specialization.name_en}</p>
                                        <p className="text-sm text-gray-500">{doc.experience_years} years exp • ${doc.price}</p>
                                    </div>
                                    <div className="text-green-600 font-medium">
                                        ID: {doc.id}
                                    </div>
                                </Card>
                            ))}
                            {doctors.length === 0 && <p className="text-gray-500">No doctors found.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
