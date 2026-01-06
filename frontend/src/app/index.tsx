import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from '../pages/HomePage/HomePage';
import { LoginPage } from '../pages/LoginPage/LoginPage';
import { RegisterPage } from '../pages/RegisterPage/RegisterPage';
import { AddPetPage } from '../pages/AddPetPage/AddPetPage';
import { BookAppointmentPage } from '../pages/BookAppointmentPage/BookAppointmentPage';
import { ManageDoctorsPage } from '../pages/ManageDoctorsPage/ManageDoctorsPage';
import { DoctorSchedulePage } from '../pages/DoctorSchedulePage/DoctorSchedulePage';
import { MyPetsPage } from '../pages/MyPetsPage/MyPetsPage';
import { AuthProvider } from '../entities/session/model/store';
import { ProtectedRoute } from './ProtectedRoute';
import { UserRole } from '../entities/user/model/types';
import { AppointmentsPage } from '../pages/AppointmentsPage/AppointmentsPage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage/AdminDashboardPage';
import { ManageClientsPage } from '../pages/ManageClientsPage/ManageClientsPage';

export const AppRouter = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Admin Routes */}
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                                <AdminDashboardPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/doctors"
                        element={
                            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                                <ManageDoctorsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/clients"
                        element={
                            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                                <ManageClientsPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* App Routes */}
                    <Route
                        path="/appointments"
                        element={
                            <ProtectedRoute allowedRoles={[UserRole.CLIENT, UserRole.DOCTOR, UserRole.ADMIN]}>
                                <AppointmentsPage />
                            </ProtectedRoute>
                        }
                    />

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
                        path="/my-pets"
                        element={
                            <ProtectedRoute allowedRoles={[UserRole.CLIENT]}>
                                <MyPetsPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/doctor/schedule"
                        element={
                            <ProtectedRoute allowedRoles={[UserRole.DOCTOR]}>
                                <DoctorSchedulePage />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
};
