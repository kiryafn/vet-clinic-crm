import { useState, useEffect, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../shared/api/api';
import { Button, Input, Card } from '../../shared/ui';
import { useErrorHandler } from '../../shared/utils/errorHandler';

// Match backend DoctorSpecialization enum
enum DoctorSpecialization {
    OPHTHALMOLOGIST = "OPHTHALMOLOGIST",
    DERMATOLOGIST = "DERMATOLOGIST",
    CARDIOLOGIST = "CARDIOLOGIST",
    THERAPIST = "THERAPIST",
    SURGEON = "SURGEON",
    DENTIST = "DENTIST"
}

interface Doctor {
    id: number;
    full_name: string;
    specialization: DoctorSpecialization;
    phone_number?: string;
    experience_years?: number;
    price?: number;
    bio?: string;
    email?: string;
}

interface EditDoctorFormProps {
    doctor: Doctor;
    onSuccess: () => void;
    onCancel: () => void;
}

export const EditDoctorForm = ({ doctor, onSuccess, onCancel }: EditDoctorFormProps) => {
    const { t } = useTranslation();
    const { extractError } = useErrorHandler();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [fullName, setFullName] = useState(doctor.full_name);
    const [specialization, setSpecialization] = useState<DoctorSpecialization>(doctor.specialization);
    const [experience, setExperience] = useState(doctor.experience_years?.toString() || '');
    const [price, setPrice] = useState(doctor.price?.toString() || '');
    const [bio, setBio] = useState(doctor.bio || '');
    const [phoneNumber, setPhoneNumber] = useState(doctor.phone_number || '');

    useEffect(() => {
        setFullName(doctor.full_name);
        setSpecialization(doctor.specialization);
        setExperience(doctor.experience_years?.toString() || '');
        setPrice(doctor.price?.toString() || '');
        setBio(doctor.bio || '');
        setPhoneNumber(doctor.phone_number || '');
    }, [doctor]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const updateData: any = {
                full_name: fullName,
                specialization,
            };

            if (experience) updateData.experience_years = parseInt(experience);
            if (price) updateData.price = parseFloat(price);
            if (bio) updateData.bio = bio;
            if (phoneNumber) updateData.phone_number = phoneNumber;

            await api.patch(`/doctors/${doctor.id}`, updateData);
            onSuccess();
        } catch (err: any) {
            setError(extractError(err));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card title={t('doctors.form.edit_title', 'Edit Doctor')}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input 
                    label={t('doctors.form.full_name')} 
                    value={fullName} 
                    onChange={e => setFullName(e.target.value)} 
                    required 
                />
                {doctor.email && (
                    <Input 
                        label={t('doctors.form.email')} 
                        value={doctor.email} 
                        disabled
                        className="bg-gray-100"
                    />
                )}

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">{t('doctors.form.specialization')}</label>
                    <select
                        value={specialization}
                        onChange={e => setSpecialization(e.target.value as DoctorSpecialization)}
                        className="w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                    >
                        {Object.values(DoctorSpecialization).map(spec => (
                            <option key={spec} value={spec}>
                                {t(`doctors.specializations.${spec}`, spec.charAt(0) + spec.slice(1).toLowerCase())}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-4">
                    <Input 
                        label={t('doctors.form.experience')} 
                        type="number" 
                        value={experience} 
                        onChange={e => setExperience(e.target.value)} 
                    />
                    <Input 
                        label={t('doctors.form.price')} 
                        type="number" 
                        value={price} 
                        onChange={e => setPrice(e.target.value)} 
                    />
                </div>

                <Input 
                    label={t('doctors.form.phone', 'Phone Number')} 
                    type="tel" 
                    value={phoneNumber} 
                    onChange={e => setPhoneNumber(e.target.value)} 
                />

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">{t('doctors.form.bio')}</label>
                    <textarea
                        className="w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all min-h-[100px]"
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                    />
                </div>

                {error && (
                    <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm whitespace-pre-line">
                        {error}
                    </div>
                )}

                <div className="flex gap-3 mt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        className="flex-1"
                    >
                        {t('pet.form.cancel')}
                    </Button>
                    <Button type="submit" isLoading={isLoading} className="flex-1">
                        {t('pet.form.save')}
                    </Button>
                </div>
            </form>
        </Card>
    );
};
