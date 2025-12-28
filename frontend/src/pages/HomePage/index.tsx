import { Header } from '../../widgets/Header';
import { Card } from '../../shared/ui';

export const HomePage = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-4xl font-bold mb-4">Welcome to Vet Clinic CRM</h1>
                <p className="text-xl text-gray-600 mb-8">
                    Manage your pets and appointments with ease.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    <Card title="Expert Doctors">
                        <p>Our team consists of highly qualified specialists.</p>
                    </Card>
                    <Card title="Online Booking">
                        <p>Book appointments in just a few clicks.</p>
                    </Card>
                    <Card title="Pet History">
                        <p>Keep track of all your pets' medical records.</p>
                    </Card>
                </div>
            </div>
        </div>
    );
};
