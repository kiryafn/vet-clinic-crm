import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Header } from '../../widgets/Header/Header';
import { Button } from '../../shared/ui';
import { useAuth } from '../../entities/session/model/store';
import { UserRole } from '../../entities/user/model/types';

import { AdminDashboard } from '../../widgets/home/ui/AdminDashboard';
import { DoctorDashboard } from '../../widgets/home/ui/DoctorDashboard';
import { ClientDashboard } from '../../widgets/home/ui/ClientDashboard';
import { GuestWelcome } from '../../widgets/home/ui/GuestWelcome';

export const HomePage = () => {
    const { t } = useTranslation();
    const { isAuthenticated, user } = useAuth();

    const renderDashboard = () => {
        if (!isAuthenticated) return <GuestWelcome />;

        switch (user?.role) {
            case UserRole.ADMIN:
                return <AdminDashboard />;
            case UserRole.DOCTOR:
                return <DoctorDashboard />;
            case UserRole.CLIENT:
            default:
                return <ClientDashboard />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pb-12 pt-24">
            <Header />

            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                        {isAuthenticated
                            ? t('home.welcome_back', { name: user?.full_name })
                            : t('home.welcome')
                        }
                    </h1>

                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        {isAuthenticated
                            ? t('home.subtitle_auth')
                            : t('home.subtitle_guest')
                        }
                    </p>

                    {!isAuthenticated && (
                        <div className="mt-8 flex justify-center gap-4">
                            <Link to="/register">
                                <Button className="text-lg px-8 py-3 shadow-lg shadow-indigo-500/30">
                                    {t('home.actions.get_started')}
                                </Button>
                            </Link>
                            <Link to="/login">
                                <Button variant="outline" className="text-lg px-8 py-3">
                                    {t('home.actions.sign_in')}
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {renderDashboard()}
            </div>
        </div>
    );
};