import { Header } from '../../widgets/Header/Header';
import { CreateDoctorForm } from '../../widgets/CreateDoctorForm/CreateDoctorForm';

export const AdminDoctorsPage = () => {
    const handleDoctorCreated = () => {
        alert('Doctor successfully created!');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <CreateDoctorForm onSuccess={handleDoctorCreated} />
                    </div>
                    <div className="p-4 bg-white rounded shadow text-gray-500">
                        Manage Users (Coming Soon)
                    </div>
                </div>
            </div>
        </div>
    );
};