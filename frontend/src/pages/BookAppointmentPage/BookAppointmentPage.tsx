import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../widgets/Header/Header';
import { Button, Input, Card } from '../../shared/ui';
import { api } from '../../shared/api/api';

interface Doctor {
    id: number;
    full_name: string; // From user relation, hopefully backend returns flattened or I need to access doctor.user.full_name
    specialization: {
        name: string;
    };
    price: number;
    user: {
        full_name: string;
    };
}

export const BookAppointmentPage = () => {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingDoctos, setIsFetchingDoctors] = useState(true);
    const [error, setError] = useState('');

    // Form state
    const [doctorId, setDoctorId] = useState('');
    const [appointmentDate, setAppointmentDate] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await api.get('/doctors/');
                setDoctors(response.data);
            } catch (err) {
                console.error('Failed to fetch doctors', err);
                setError('Failed to load doctors list');
            } finally {
                setIsFetchingDoctors(false);
            }
        };
        fetchDoctors();
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await api.post('/appointments/', {
                doctor_id: parseInt(doctorId),
                appointment_date: new Date(appointmentDate).toISOString(),
                description,
                status: 'SCHEDULED' // assuming default or required
            });
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to book appointment');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex flex-col">
            <Header />
            <div className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
                <Card title="Book Appointment" className="w-full max-w-lg">
                    {isFetchingDoctos ? (
                        <div className="text-center py-8">Loading doctors...</div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="input-wrapper">
                                <label className="input-label">Select Doctor</label>
                                <select
                                    value={doctorId}
                                    onChange={e => setDoctorId(e.target.value)}
                                    className="input"
                                    required
                                >
                                    <option value="">-- Choose a Doctor --</option>
                                    {doctors.map(doctor => (
                                        <option key={doctor.id} value={doctor.id}>
                                            {doctor.user?.full_name || doctor.full_name} - {doctor.specialization?.name} (${doctor.price})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <Input
                                label="Date & Time"
                                type="datetime-local"
                                value={appointmentDate}
                                onChange={e => setAppointmentDate(e.target.value)}
                                required
                            />

                            <div className="input-wrapper">
                                <label className="input-label">Reason / Description</label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="input min-h-[100px]"
                                    placeholder="Briefly describe the issue..."
                                    required
                                />
                            </div>

                            {error && <div className="text-red-500 text-sm">{error}</div>}

                            <div className="flex gap-3 mt-4">
                                <Button type="button" variant="outline" onClick={() => navigate('/')} className="w-full">
                                    Cancel
                                </Button>
                                <Button type="submit" isLoading={isLoading} className="w-full" disabled={!doctorId}>
                                    Book Appointment
                                </Button>
                            </div>
                        </form>
                    )}
                </Card>
            </div>
        </div>
    );
};
