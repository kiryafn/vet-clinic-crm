import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from '../pages/HomePage/HomePage';
import { LoginPage } from '../pages/LoginPage/LoginPage';
import { RegisterPage } from '../pages/RegisterPage/RegisterPage';
import { AddPetPage } from '../pages/AddPetPage/AddPetPage';
import { BookAppointmentPage } from '../pages/BookAppointmentPage/BookAppointmentPage';
import { AdminDoctorsPage } from '../pages/AdminDoctorsPage/AdminDoctorsPage';
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
                        path="/add-pet"
                        element={
                            <ProtectedRoute allowedRoles={[UserRole.CLIENT]}>
                                <AddPetPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/book-appointment"
                        element={
                            <ProtectedRoute allowedRoles={[UserRole.CLIENT]}>
                                <BookAppointmentPage />
                            </ProtectedRoute>
                        }
                    />

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
