import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { AdminDoctorsPage } from '../pages/AdminDoctorsPage';
import { AuthProvider } from '../entities/session/model/store';
import { ProtectedRoute } from './ProtectedRoute';
import { UserRole } from '../entities/user/model/types';

export const AppRouter = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                                <AdminDoctorsPage />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
};
