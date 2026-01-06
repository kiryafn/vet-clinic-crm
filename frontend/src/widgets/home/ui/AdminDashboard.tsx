import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Button } from '../../../shared/ui';

export const AdminDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            <Card
                className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-indigo-500"
                title="Admin Dashboard"
            >
                <div className="flex flex-col h-full">
                    <p className="text-gray-600 mb-6 flex-grow">
                        Manage doctors, clients, and appointments. Access reports and system settings.
                    </p>
                    <Button
                        onClick={() => navigate('/admin')}
                        className="w-full shadow-md shadow-indigo-500/20"
                    >
                        Go to Dashboard
                    </Button>
                </div>
            </Card>
        </div>
    );
};