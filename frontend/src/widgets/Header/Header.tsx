import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../entities/session/model/store';
import { UserRole } from '../../entities/user/model/types';
import { Button } from '../../shared/ui';

export const Header = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { t, i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'uk' : 'en';
        i18n.changeLanguage(newLang);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-lg border-b border-white/20 shadow-sm transition-all duration-300">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                    VetClinic CRM
                </Link>

                <nav className="flex items-center gap-6">
                    <button
                        onClick={toggleLanguage}
                        className="font-bold text-gray-600 hover:text-indigo-600 transition-colors w-8"
                        title="Switch Language"
                    >
                        {i18n.language === 'en' ? 'UA' : 'EN'}
                    </button>

                    {isAuthenticated ? (
                        <>
                            <span className="text-gray-700 font-medium">
                                {t('header.hello', { name: user?.full_name })}
                            </span>

                            {user?.role === UserRole.ADMIN && (
                                <Link to="/admin" className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                                    {t('header.admin_dashboard')}
                                </Link>
                            )}

                            <Button variant="outline" onClick={logout} className="!py-2 !px-4 text-sm">
                                {t('header.logout')}
                            </Button>
                        </>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link to="/login">
                                <Button variant="outline" className="!py-2 !px-5 text-sm">
                                    {t('header.sign_in')}
                                </Button>
                            </Link>
                            <Link to="/register">
                                <Button className="!py-2 !px-5 text-sm shadow-md hover:shadow-lg">
                                    {t('header.sign_up')}
                                </Button>
                            </Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
};