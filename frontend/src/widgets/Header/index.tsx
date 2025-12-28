import { Link } from 'react-router-dom';
import { useAuth } from '../../entities/session/model/store';
import { UserRole } from '../../entities/user/model/types';
import { Button } from '../../shared/ui';

export const Header = () => {
    const { user, isAuthenticated, logout } = useAuth();

    return (
        <header className="bg-white border-b border-gray-200 py-4 mb-8">
            <div className="container mx-auto px-4 flex justify-between items-center">
                <Link to="/" className="text-xl font-bold text-blue-600">
                    VetClinic CRM
                </Link>

                <nav className="flex items-center gap-4">
                    {isAuthenticated ? (
                        <>
                            <span className="text-gray-600">Hello, {user?.full_name}</span>

                            {user?.role === UserRole.ADMIN && (
                                <Link to="/admin" className="text-blue-600 hover:underline">
                                    Admin Dashboard
                                </Link>
                            )}

                            <Button variant="outline" onClick={logout}>
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">
                                <Button variant="outline">Sign In</Button>
                            </Link>
                            <Link to="/register">
                                <Button>Sign Up</Button>
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};
