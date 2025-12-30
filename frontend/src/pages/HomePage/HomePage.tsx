import { Link } from 'react-router-dom';
import { Header } from '../../widgets/Header/Header';
import { Card, Button } from '../../shared/ui';
import { useAuth } from '../../entities/session/model/store';

export const HomePage = () => {
    const { isAuthenticated, user } = useAuth();

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pb-12">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                        {isAuthenticated ? `Welcome back, ${user?.full_name}!` : 'Welcome to Vet Clinic'}
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        {isAuthenticated
                            ? 'Manage your pets\' health and appointments from your personal dashboard.'
                            : 'The best care for your furry friends. Join us today to manage appointments and health records.'}
                    </p>

                    {!isAuthenticated && (
                        <div className="mt-8 flex justify-center gap-4">
                            <Link to="/register">
                                <Button className="text-lg px-8 py-3 shadow-lg shadow-indigo-500/30">Get Started</Button>
                            </Link>
                            <Link to="/login">
                                <Button variant="outline" className="text-lg px-8 py-3">Sign In</Button>
                            </Link>
                        </div>
                    )}
                </div>

                {isAuthenticated ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <Link to="/add-pet" className="group">
                            <Card className="h-full hover:shadow-2xl transition-all duration-300 border-l-4 border-l-indigo-500 group-hover:-translate-y-1">
                                <h3 className="text-2xl font-bold mb-3 text-indigo-900">Add New Pet</h3>
                                <p className="text-gray-600 mb-6">Register a new pet to your account to track their medical history.</p>
                                <div className="text-indigo-600 font-semibold group-hover:translate-x-2 transition-transform inline-flex items-center">
                                    Add Pet &rarr;
                                </div>
                            </Card>
                        </Link>

                        <Link to="/book-appointment" className="group">
                            <Card className="h-full hover:shadow-2xl transition-all duration-300 border-l-4 border-l-pink-500 group-hover:-translate-y-1">
                                <h3 className="text-2xl font-bold mb-3 text-indigo-900">Book Appointment</h3>
                                <p className="text-gray-600 mb-6">Schedule a visit with one of our expert doctors.</p>
                                <div className="text-pink-600 font-semibold group-hover:translate-x-2 transition-transform inline-flex items-center">
                                    Book Now &rarr;
                                </div>
                            </Card>
                        </Link>

                        <div className="group opacity-75 cursor-not-allowed">
                            <Card className="h-full border-l-4 border-l-gray-400 bg-gray-50/50">
                                <h3 className="text-2xl font-bold mb-3 text-gray-500">My Appointments</h3>
                                <p className="text-gray-500 mb-6">View and manage your upcoming and past appointments.</p>
                                <div className="text-gray-400 font-semibold italic">
                                    Coming Soon
                                </div>
                            </Card>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <Card className="text-center hover:shadow-xl transition-all duration-300">
                            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">👨‍⚕️</div>
                            <h3 className="text-xl font-bold mb-2">Expert Doctors</h3>
                            <p className="text-gray-600">Qualified specialists ready to treat your pets with care.</p>
                        </Card>
                        <Card className="text-center hover:shadow-xl transition-all duration-300">
                            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">📅</div>
                            <h3 className="text-xl font-bold mb-2">Easy Booking</h3>
                            <p className="text-gray-600">Schedule appointments online in just a few clicks.</p>
                        </Card>
                        <Card className="text-center hover:shadow-xl transition-all duration-300">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🐕</div>
                            <h3 className="text-xl font-bold mb-2">Pet History</h3>
                            <p className="text-gray-600">Keep all medical records in one secure place.</p>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};
