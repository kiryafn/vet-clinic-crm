import { Link } from 'react-router-dom';
import { useAuth } from '../../entities/session/model/store';
import { UserRole } from '../../entities/user/model/types';
import { Button } from '../../shared/ui';

export const Header = () => {
    const { user, isAuthenticated, logout } = useAuth();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-lg border-b border-white/20 shadow-sm transition-all duration-300">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                    VetClinic CRM
                </Link>

                <nav className="flex items-center gap-6">
                    {isAuthenticated ? (
                        <>
                            <span className="text-gray-700 font-medium">Hello, {user?.full_name}</span>

                            {user?.role === UserRole.ADMIN && (
                                <Link to="/admin" className="text-primary hover:text-indigo-700 font-medium transition-colors">
                                    Admin Dashboard
                                </Link>
                            )}

                            <Button variant="outline" onClick={logout} className="!py-2 !px-4 text-sm">
                                Logout
                            </Button>
                        </>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link to="/login">
                                <Button variant="outline" className="!py-2 !px-5 text-sm">Sign In</Button>
                            </Link>
                            <Link to="/register">
                                <Button className="!py-2 !px-5 text-sm shadow-md hover:shadow-lg">Sign Up</Button>
                            </Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
};
