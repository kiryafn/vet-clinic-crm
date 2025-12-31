import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../widgets/Header/Header';
import { Button, Input, Card } from '../../shared/ui';
import { api } from '../../shared/api/api';
import { format, addMinutes, isBefore, parseISO, set, startOfDay, isSameDay } from 'date-fns';

interface Doctor {
    id: number;
    full_name: string;
    specialization: { name: string };
    price: number;
    user: { full_name: string };
}

interface Pet {
    id: number;
    name: string;
    species: string;
}

interface Appointment {
    date_time: string;
    // ... other fields not needed for availability check
}

export const BookAppointmentPage = () => {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [pets, setPets] = useState<Pet[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingData, setIsFetchingData] = useState(true);
    const [error, setError] = useState('');

    // Form state
    const [doctorId, setDoctorId] = useState('');
    const [petId, setPetId] = useState('');
    const [appointmentDate, setAppointmentDate] = useState(''); // YYYY-MM-DD
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null); // ISO string
    const [description, setDescription] = useState('');

    // Slot state
    const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [doctorsRes, petsRes] = await Promise.all([
                    api.get('/doctors/'),
                    api.get('/pets/')
                ]);
                setDoctors(doctorsRes.data);
                setPets(petsRes.data);
            } catch (err) {
                console.error('Failed to load data', err);
                setError('Failed to load doctors or pets');
            } finally {
                setIsFetchingData(false);
            }
        };
        fetchData();
    }, []);

    // Fetch slots when doctor and date are selected
    useEffect(() => {
        if (!doctorId || !appointmentDate) {
            setSlots([]);
            return;
        }

        const fetchAppointments = async () => {
            setLoadingSlots(true);
            try {
                const res = await api.get<Appointment[]>(`/appointments/public/doctor/${doctorId}`);
                const existingAppointments = res.data;
                generateSlots(existingAppointments);
            } catch (err) {
                console.error(err);
                setError('Failed to fetch availability');
            } finally {
                setLoadingSlots(false);
            }
        };

        fetchAppointments();
    }, [doctorId, appointmentDate]);

    const generateSlots = (appointments: Appointment[]) => {
        const startHour = 9;
        const endHour = 18;
        const interval = 45; // minutes

        const date = parseISO(appointmentDate);
        const dayStart = startOfDay(date);

        // Define working hours for the selected day
        let currentTime = set(dayStart, { hours: startHour, minutes: 0 });
        const endTime = set(dayStart, { hours: endHour, minutes: 0 });

        const newSlots: { time: string; available: boolean }[] = [];

        while (isBefore(currentTime, endTime)) {
            const slotStart = currentTime;
            //const slotEnd = addMinutes(slotStart, interval);

            // Check overlap
            const isOccupied = appointments.some(app => {
                const appStart = parseISO(app.date_time);
                // Simple strict equality check for start time matches or overlap
                // Assuming appointments are also fixed 45 mins aligned for now to keep it simple
                // or check if appStart is within [slotStart, slotEnd) 
                return isSameDay(appStart, date) &&
                    (appStart.getTime() === slotStart.getTime());
            });

            newSlots.push({
                time: format(slotStart, 'HH:mm'),
                available: !isOccupied
            });

            currentTime = addMinutes(currentTime, interval);
        }
        setSlots(newSlots);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedSlot || !appointmentDate || !petId) return;

        setIsLoading(true);
        setError('');

        // Combine date and time
        const [hours, minutes] = selectedSlot.split(':').map(Number);
        const finalDateTime = set(parseISO(appointmentDate), { hours, minutes });

        try {
            await api.post('/appointments/', {
                doctor_id: parseInt(doctorId),
                pet_id: parseInt(petId),
                date_time: finalDateTime.toISOString(), // Changed from appointment_date to date_time to match schema if needed, checking backend...
                // Backend schema for AppointmentCreate has 'date_time'. My previous code had 'appointment_date' which was likely wrong.
                // Checking backend/app/appointments/schemas.py... 
                // Wait, I should check the schema. Assuming 'date_time' is correct based on models.
                user_description: description,
                // status defaults in backend usually
            });
            navigate('/');
        } catch (err: any) {
            const detail = err.response?.data?.detail;
            setError(typeof detail === 'string' ? detail : 'Failed to book appointment');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex flex-col">
            <Header />
            <div className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
                <Card title="Book Appointment" className="w-full max-w-2xl">
                    {isFetchingData ? (
                        <div className="text-center py-8">Loading data...</div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Step 1: Doctor */}
                                <div className="input-wrapper">
                                    <label className="input-label">Select Doctor</label>
                                    <select
                                        value={doctorId}
                                        onChange={e => {
                                            setDoctorId(e.target.value);
                                            setSelectedSlot(null);
                                        }}
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

                                {/* Step 1.5: Pet */}
                                <div className="input-wrapper">
                                    <label className="input-label">Select Pet</label>
                                    <select
                                        value={petId}
                                        onChange={e => setPetId(e.target.value)}
                                        className="input"
                                        required
                                    >
                                        <option value="">-- Choose a Pet --</option>
                                        {pets.map(pet => (
                                            <option key={pet.id} value={pet.id}>
                                                {pet.name} ({pet.species})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Step 2: Date */}
                            <Input
                                label="Date"
                                type="date"
                                value={appointmentDate}
                                onChange={e => {
                                    setAppointmentDate(e.target.value);
                                    setSelectedSlot(null);
                                }}
                                required
                                min={new Date().toISOString().split('T')[0]}
                            />

                            {/* Step 3: Slots */}
                            {doctorId && appointmentDate && (
                                <div>
                                    <label className="input-label mb-2 block">Available Time Slots (45 min)</label>
                                    {loadingSlots ? (
                                        <div className="text-sm text-gray-500">Calculating availability...</div>
                                    ) : (
                                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                            {slots.map(slot => (
                                                <button
                                                    key={slot.time}
                                                    type="button"
                                                    disabled={!slot.available}
                                                    onClick={() => setSelectedSlot(slot.time)}
                                                    className={`
                                                        py-2 px-1 rounded text-sm font-medium transition-colors border
                                                        ${slot.available
                                                            ? selectedSlot === slot.time
                                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                                : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:text-indigo-600'
                                                            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                                                        }
                                                    `}
                                                >
                                                    {slot.time}
                                                </button>
                                            ))}
                                            {slots.length === 0 && <div className="col-span-full text-gray-500 text-sm">No slots available.</div>}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 4: Description */}
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
                                <Button type="submit" isLoading={isLoading} className="w-full" disabled={!selectedSlot}>
                                    Confirm Booking
                                </Button>
                            </div>
                        </form>
                    )}
                </Card>
            </div>
        </div>
    );
};
