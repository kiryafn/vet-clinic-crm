import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { appointmentApi } from '../../../../entities/appointment/api/appointmentApi';
import { api } from '../../../../shared/api/api';
import { useErrorHandler } from '../../../../shared/utils/errorHandler';

interface Doctor {
    id: number;
    full_name: string;
    specialization: { name: string } | string;
}

interface Pet {
    id: number;
    name: string;
    species: string;
}

interface ValidationErrors {
    doctorId?: string;
    petId?: string;
    date?: string;
    slot?: string;
    description?: string;
}

export const useBookAppointment = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { extractError } = useErrorHandler();

    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [pets, setPets] = useState<Pet[]>([]);
    const [isFetchingData, setIsFetchingData] = useState(true);

    const [doctorId, setDoctorId] = useState('');
    const [petId, setPetId] = useState('');
    const [date, setDate] = useState('');
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [description, setDescription] = useState('');

    const [slots, setSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [doctorsRes, petsRes] = await Promise.all([
                    api.get('/doctors/'),
                    api.get('/pets/', { params: { page: 1, limit: 100 } })
                ]);
                setDoctors(doctorsRes.data);
                const petsData = petsRes.data?.items || petsRes.data || [];
                setPets(Array.isArray(petsData) ? petsData : []);
            } catch (err: any) {
                console.error('Failed to load data', err);
                const errorMessage = extractError(err) || t('booking.errors.load_failed');
                setError(errorMessage);
            } finally {
                setIsFetchingData(false);
            }
        };
        fetchData();
    }, [t, extractError]);

    useEffect(() => {
        if (!doctorId || !date) {
            setSlots([]);
            return;
        }

        const fetchSlots = async () => {
            setLoadingSlots(true);
            setError('');
            try {
                const availableSlots = await appointmentApi.getSlots(Number(doctorId), date);
                setSlots(availableSlots || []);
            } catch (err: any) {
                console.error('Error fetching slots:', err);
                const errorMessage = extractError(err) || t('booking.errors.slots_failed');
                setError(errorMessage);
            } finally {
                setLoadingSlots(false);
            }
        };

        fetchSlots();
    }, [doctorId, date, t, extractError]);

    const validate = useCallback((): boolean => {
        const newErrors: ValidationErrors = {};

        if (!doctorId) {
            newErrors.doctorId = t('booking.validation.select_doctor');
        }

        if (!petId) {
            newErrors.petId = t('booking.validation.select_pet');
        }

        if (!date) {
            newErrors.date = t('booking.validation.select_date');
        } else {
            const selectedDate = new Date(date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                newErrors.date = t('booking.validation.date_past');
            }
        }

        if (!selectedSlot) {
            newErrors.slot = t('booking.validation.select_slot');
        } else {
            const slotDate = new Date(selectedSlot);
            const now = new Date();
            if (slotDate <= now) {
                newErrors.slot = t('booking.validation.slot_future');
            }
        }

        if (description && description.trim().length > 500) {
            newErrors.description = t('booking.validation.description_max');
        }

        setValidationErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [doctorId, petId, date, selectedSlot, description, t]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate() || !selectedSlot) return;

        setIsSubmitting(true);
        setError('');

        try {
            await appointmentApi.create({
                doctor_id: Number(doctorId),
                pet_id: Number(petId),
                date_time: selectedSlot,
                reason: description.trim() || undefined
            });
            navigate('/appointments');
        } catch (err: any) {
            const errorMessage = extractError(err) || t('booking.errors.book_failed');
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    }, [doctorId, petId, selectedSlot, description, validate, navigate, extractError, t]);

    const clearValidationError = useCallback((field: keyof ValidationErrors) => {
        setValidationErrors(prev => {
            const updated = { ...prev };
            delete updated[field];
            return updated;
        });
    }, []);

    return {
        // Data
        doctors,
        pets,
        slots,
        // State
        doctorId,
        petId,
        date,
        selectedSlot,
        description,
        error,
        isSubmitting,
        isFetchingData,
        loadingSlots,
        validationErrors,
        // Setters
        setDoctorId: (id: string) => {
            setDoctorId(id);
            setSelectedSlot(null);
            clearValidationError('doctorId');
        },
        setPetId: (id: string) => {
            setPetId(id);
            clearValidationError('petId');
        },
        setDate: (d: string) => {
            setDate(d);
            setSelectedSlot(null);
            clearValidationError('date');
        },
        setSelectedSlot: (slot: string | null) => {
            setSelectedSlot(slot);
            clearValidationError('slot');
        },
        setDescription: (desc: string) => {
            setDescription(desc);
            clearValidationError('description');
        },
        // Actions
        handleSubmit,
        clearError: () => setError(''),
    };
};
