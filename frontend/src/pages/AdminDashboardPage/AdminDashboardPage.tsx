import { useNavigate } from 'react-router-dom';
import { Header } from '../../widgets/Header/Header';
import { Card, Button } from '../../shared/ui';

export const AdminDashboardPage = () => {
    const navigate = useNavigate();

    const sections = [
        {
            title: 'Manage Doctors',
            description: 'Register new doctors, view staff list, and manage specializations.',
            action: 'Manage Staff',
            path: '/admin/doctors',
            icon: '👨‍⚕️',
            color: 'bg-blue-50 text-blue-700'
        },
        {
            title: 'Manage Clients',
            description: 'View registered clients, manage details, and remove accounts.',
            action: 'View Clients',
            path: '/admin/clients',
            icon: '👥',
            color: 'bg-green-50 text-green-700'
        },
        {
            title: 'All Appointments',
            description: 'View and manage all scheduled appointments across the clinic.',
            action: 'View Schedule',
            path: '/appointments',
            icon: '📅',
            color: 'bg-purple-50 text-purple-700'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Header />
            <div className="container mx-auto px-4 py-8 pt-24">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-500 mt-2">Welcome back. Here's an overview of the clinic.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sections.map((section) => (
                        <div
                            key={section.title}
                            onClick={() => navigate(section.path)}
                            className="bg-white p-6 rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl transition-all cursor-pointer group"
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4 ${section.color} group-hover:scale-110 transition-transform`}>
                                {section.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{section.title}</h3>
                            <p className="text-gray-500 mb-6 text-sm leading-relaxed">{section.description}</p>
                            <Button className="w-full" variant="outline">
                                {section.action}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
