import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../../user/model/types';
import type { SessionState } from './types';
import { sessionApi } from '../api/sessionApi';

const AuthContext = createContext<SessionState | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const userData = await sessionApi.getMe();
                setUser(userData);
            }
        } catch (error) {
            console.error('Auth check failed', error);
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/login';
    };

    if (loading) {
        return <div>Loading app...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, checkAuth, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
