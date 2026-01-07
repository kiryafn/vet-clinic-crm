import { useState, type FormEvent } from 'react';
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

export const CreateDoctorForm = ({ onSuccess }: { onSuccess: () => void }) => {
    const { t } = useTranslation();
    const { extractError } = useErrorHandler();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [specialization, setSpecialization] = useState<DoctorSpecialization>(DoctorSpecialization.THERAPIST);
    const [experience, setExperience] = useState('');
    const [bio, setBio] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await api.post('/doctors/', {
                email,
                password,
                full_name: fullName,
                specialization, // Send enum value string
                experience_years: parseInt(experience),
                bio
            });
            onSuccess();
            // Reset form
            setFullName('');
            setEmail('');
            setPassword('');
            setExperience('');
            setBio('');
            setSpecialization(DoctorSpecialization.THERAPIST);
        } catch (err: any) {
            setError(extractError(err));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card title={t('doctors.form.title')}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input label={t('doctors.form.full_name')} value={fullName} onChange={e => setFullName(e.target.value)} required />
                <Input label={t('doctors.form.email')} type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                <Input label={t('doctors.form.password')} type="password" value={password} onChange={e => setPassword(e.target.value)} required />

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

                <Input label={t('doctors.form.experience')} type="number" value={experience} onChange={e => setExperience(e.target.value)} required />

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

                <Button type="submit" isLoading={isLoading}>{t('doctors.form.submit')}</Button>
            </form>
        </Card>
    );
};
