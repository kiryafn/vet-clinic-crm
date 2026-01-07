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

// Функция для извлечения читаемого сообщения об ошибке из ответа FastAPI
const extractErrorMessage = (error: any): string => {
    if (!error) return 'An unknown error occurred';
    
    // Если это строка, возвращаем её
    if (typeof error === 'string') return error;
    
    // Если это объект ошибки FastAPI/Pydantic с массивом detail
    // Проверяем response.data.detail
    if (error?.response?.data) {
        const data = error.response.data;
        
        // Если detail - это массив (валидационные ошибки FastAPI/Pydantic)
        if (Array.isArray(data.detail)) {
            // Объединяем все сообщения об ошибках
            const messages = data.detail
                .filter((err: any) => err?.msg && typeof err.msg === 'string')
                .map((err: any) => {
                    const location = Array.isArray(err.loc) ? err.loc.slice(1).join('.') : '';
                    return `${err.msg}${location ? ` (${location})` : ''}`;
                });
            return messages.length > 0 ? messages.join('; ') : 'Validation error occurred';
        }
        
        // Если detail - это строка
        if (data.detail && typeof data.detail === 'string') {
            return data.detail;
        }
    }
    
    // Если есть message
    if (error?.message && typeof error.message === 'string') {
        return error.message;
    }
    
    // Если error - это объект, попробуем конвертировать в строку (для отладки)
    try {
        return JSON.stringify(error);
    } catch {
        return 'An error occurred';
    }
};

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
    
    // Validation errors
    const [validationErrors, setValidationErrors] = useState<{
        doctorId?: string;
        petId?: string;
        date?: string;
        slot?: string;
        description?: string;
    }>({});

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
            } catch (err: any) {
                console.error('Failed to load data', err);
                const errorMessage = extractErrorMessage(err) || 'Failed to load doctors or pets. Please try again.';
                setError(errorMessage);
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
                const errorMessage = extractErrorMessage(err) || 'Failed to load available slots';
                setError(errorMessage);
            } finally {
                setLoadingSlots(false);
            }
        };

        fetchSlots();
    }, [doctorId, date]);

    const validate = (): boolean => {
        const newErrors: typeof validationErrors = {};

        if (!doctorId) {
            newErrors.doctorId = 'Please select a doctor';
        }

        if (!petId) {
            newErrors.petId = 'Please select a pet';
        }

        if (!date) {
            newErrors.date = 'Please select a date';
        } else {
            const selectedDate = new Date(date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                newErrors.date = 'Date cannot be in the past';
            }
        }

        if (!selectedSlot) {
            newErrors.slot = 'Please select a time slot';
        } else {
            const slotDate = new Date(selectedSlot);
            const now = new Date();
            if (slotDate <= now) {
                newErrors.slot = 'Selected time slot must be in the future';
            }
        }

        if (description && description.trim().length > 500) {
            newErrors.description = 'Description cannot exceed 500 characters';
        }

        setValidationErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        setError('');

        try {
            await appointmentApi.create({
                doctor_id: Number(doctorId),
                pet_id: Number(petId),
                date_time: selectedSlot, // Slot is already an ISO string from backend
                reason: description.trim() || undefined
            });
            navigate('/appointments');
        } catch (err: any) {
            const errorMessage = extractErrorMessage(err) || 'Failed to book appointment';
            setError(errorMessage);
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
                                            if (validationErrors.doctorId) {
                                                setValidationErrors({ ...validationErrors, doctorId: undefined });
                                            }
                                        }}
                                        className={`w-full rounded-xl border bg-gray-50 p-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all ${
                                            validationErrors.doctorId ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                        required
                                    >
                                        <option value="">-- Choose a Doctor --</option>
                                        {doctors.map(doctor => (
                                            <option key={doctor.id} value={doctor.id}>
                                                {doctor.full_name} ({typeof doctor.specialization === 'object' ? doctor.specialization.name : doctor.specialization}) - ${doctor.price}
                                            </option>
                                        ))}
                                    </select>
                                    {validationErrors.doctorId && (
                                        <span className="text-xs text-red-500 mt-1 ml-1">{validationErrors.doctorId}</span>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Pet</label>
                                    <select
                                        value={petId}
                                        onChange={e => {
                                            setPetId(e.target.value);
                                            if (validationErrors.petId) {
                                                setValidationErrors({ ...validationErrors, petId: undefined });
                                            }
                                        }}
                                        className={`w-full rounded-xl border bg-gray-50 p-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all ${
                                            validationErrors.petId ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                        required
                                    >
                                        <option value="">-- Choose a Pet --</option>
                                        {Array.isArray(pets) && pets.map(pet => (
                                            <option key={pet.id} value={pet.id}>
                                                {pet.name} ({pet.species})
                                            </option>
                                        ))}
                                    </select>
                                    {validationErrors.petId && (
                                        <span className="text-xs text-red-500 mt-1 ml-1">{validationErrors.petId}</span>
                                    )}
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
                                    if (validationErrors.date) {
                                        setValidationErrors({ ...validationErrors, date: undefined });
                                    }
                                }}
                                error={validationErrors.date}
                                required
                                min={new Date().toISOString().split('T')[0]}
                            />

                            {/* Slot Selection */}
                            {doctorId && date && (
                                <div className="animate-fade-in">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Available Time Slots</label>
                                    {validationErrors.slot && (
                                        <span className="text-xs text-red-500 mb-2 block">{validationErrors.slot}</span>
                                    )}

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
                                                        onClick={() => {
                                                            setSelectedSlot(slotIso);
                                                            if (validationErrors.slot) {
                                                                setValidationErrors({ ...validationErrors, slot: undefined });
                                                            }
                                                        }}
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
                                    onChange={e => {
                                        setDescription(e.target.value);
                                        if (validationErrors.description) {
                                            setValidationErrors({ ...validationErrors, description: undefined });
                                        }
                                    }}
                                    className={`w-full rounded-xl border bg-gray-50 p-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all min-h-[100px] ${
                                        validationErrors.description ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                    placeholder="Briefly describe the issue..."
                                    maxLength={500}
                                />
                                {validationErrors.description && (
                                    <span className="text-xs text-red-500 mt-1 ml-1">{validationErrors.description}</span>
                                )}
                                <div className="text-xs text-gray-500 mt-1 text-right">
                                    {description.length}/500
                                </div>
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
