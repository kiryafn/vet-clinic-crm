import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Header } from '../../widgets/Header/Header';
import { Button, Input, Card, Alert } from '../../shared/ui';
import { api } from '../../shared/api/api';
import { appointmentApi } from '../../entities/appointment/api/appointmentApi';

interface Doctor {
    id: number;
    full_name: string;
    specialization: { name: string } | string;
    price: number;
}

interface Pet {
    id: number;
    name: string;
    species: string;
}

export const BookAppointmentPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Data state
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [pets, setPets] = useState<Pet[]>([]);
    const [isFetchingData, setIsFetchingData] = useState(true);

    // Form state
    const [doctorId, setDoctorId] = useState('');
    const [petId, setPetId] = useState('');
    const [date, setDate] = useState('');
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [description, setDescription] = useState('');

    // Slots state
    const [slots, setSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    // UI state
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [doctorsRes, petsRes] = await Promise.all([
                    api.get('/doctors/'),
                    api.get('/pets/', { params: { page: 1, limit: 100 } }) // Загружаем все питомцы
                ]);
                setDoctors(doctorsRes.data);
                // Обрабатываем пагинированный ответ
                const petsData = petsRes.data?.items || petsRes.data || [];
                setPets(Array.isArray(petsData) ? petsData : []);
            } catch (err) {
                console.error('Failed to load data', err);
                setError('Failed to load doctors or pets. Please try again.');
            } finally {
                setIsFetchingData(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (!doctorId || !date) {
            setSlots([]);
            return;
        }

        const fetchSlots = async () => {
            setLoadingSlots(true);
            setError(''); // Очищаем предыдущие ошибки
            try {
                // Backend expects date string in YYYY-MM-DD format
                // appointmentApi.getSlots returns ISO strings of available start times
                console.log('Fetching slots for doctor:', doctorId, 'date:', date);
                const availableSlots = await appointmentApi.getSlots(Number(doctorId), date);
                console.log('Received slots:', availableSlots);
                setSlots(availableSlots || []);
            } catch (err: any) {
                console.error('Error fetching slots:', err);
                const errorMessage = err?.response?.data?.detail || err?.message || 'Failed to load available slots';
                setError(errorMessage);
            } finally {
                setLoadingSlots(false);
            }
        };

        fetchSlots();
    }, [doctorId, date]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedSlot || !petId || !doctorId) return;

        setIsSubmitting(true);
        setError('');

        try {
            await appointmentApi.create({
                doctor_id: Number(doctorId),
                pet_id: Number(petId),
                date_time: selectedSlot, // Slot is already an ISO string from backend
                user_description: description
            });
            navigate('/appointments');
        } catch (err: any) {
            const detail = err.response?.data?.detail;
            setError(typeof detail === 'string' ? detail : 'Failed to book appointment');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <div className="flex-1 container mx-auto px-4 py-8 pt-24 flex justify-center">
                <Card title={t('home.cards.book_appointment')} className="w-full max-w-2xl">
                    {error && (
                        <div className="mb-6">
                            <Alert variant="error" title="Error">
                                {error}
                            </Alert>
                        </div>
                    )}

                    {isFetchingData ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            {/* Doctor & Pet Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Doctor</label>
                                    <select
                                        value={doctorId}
                                        onChange={e => {
                                            setDoctorId(e.target.value);
                                            setSelectedSlot(null);
                                        }}
                                        className="w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                                        required
                                    >
                                        <option value="">-- Choose a Doctor --</option>
                                        {doctors.map(doctor => (
                                            <option key={doctor.id} value={doctor.id}>
                                                {doctor.full_name} ({typeof doctor.specialization === 'object' ? doctor.specialization.name : doctor.specialization}) - ${doctor.price}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Pet</label>
                                    <select
                                        value={petId}
                                        onChange={e => setPetId(e.target.value)}
                                        className="w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                                        required
                                    >
                                        <option value="">-- Choose a Pet --</option>
                                        {Array.isArray(pets) && pets.map(pet => (
                                            <option key={pet.id} value={pet.id}>
                                                {pet.name} ({pet.species})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Date Selection */}
                            <Input
                                label="Date"
                                type="date"
                                value={date}
                                onChange={e => {
                                    setDate(e.target.value);
                                    setSelectedSlot(null);
                                }}
                                required
                                min={new Date().toISOString().split('T')[0]}
                            />

                            {/* Slot Selection */}
                            {doctorId && date && (
                                <div className="animate-fade-in">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Available Time Slots</label>

                                    {loadingSlots ? (
                                        <div className="text-gray-500 text-sm">Loading slots...</div>
                                    ) : slots.length > 0 ? (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                            {slots.map(slotIso => {
                                                const timeStr = format(new Date(slotIso), 'HH:mm');
                                                const isSelected = selectedSlot === slotIso;
                                                return (
                                                    <button
                                                        key={slotIso}
                                                        type="button"
                                                        onClick={() => setSelectedSlot(slotIso)}
                                                        className={`
                                                            py-2 px-3 rounded-lg text-sm font-medium transition-all text-center
                                                            ${isSelected
                                                                ? 'bg-indigo-600 text-white shadow-md transform scale-105'
                                                                : 'bg-white border border-gray-200 text-gray-700 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm'
                                                            }
                                                        `}
                                                    >
                                                        {timeStr}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-gray-500 text-sm italic bg-gray-50 p-4 rounded-lg text-center">
                                            No available slots for this date. Please try another day.
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all min-h-[100px]"
                                    placeholder="Briefly describe the issue..."
                                    required
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/')}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    isLoading={isSubmitting}
                                    disabled={!selectedSlot || !petId}
                                    className="flex-1 shadow-lg shadow-indigo-500/20"
                                >
                                    Confirm Appointment
                                </Button>
                            </div>
                        </form>
                    )}
                </Card>
            </div>
        </div>
    );
};
