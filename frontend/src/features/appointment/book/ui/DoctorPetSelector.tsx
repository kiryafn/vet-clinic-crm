import { useTranslation } from 'react-i18next';

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

interface DoctorPetSelectorProps {
    doctors: Doctor[];
    pets: Pet[];
    doctorId: string;
    petId: string;
    onDoctorChange: (id: string) => void;
    onPetChange: (id: string) => void;
    errors: {
        doctorId?: string;
        petId?: string;
    };
}

export const DoctorPetSelector = ({
    doctors,
    pets,
    doctorId,
    petId,
    onDoctorChange,
    onPetChange,
    errors,
}: DoctorPetSelectorProps) => {
    const { t } = useTranslation();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('booking.select_doctor')}
                </label>
                <select
                    value={doctorId}
                    onChange={e => onDoctorChange(e.target.value)}
                    className={`w-full rounded-xl border bg-gray-50 p-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all ${
                        errors.doctorId ? 'border-red-500' : 'border-gray-200'
                    }`}
                    required
                >
                    <option value="">{t('booking.choose_doctor')}</option>
                    {doctors.map(doctor => {
                        const specKey = typeof doctor.specialization === 'object' 
                            ? doctor.specialization.name 
                            : doctor.specialization;
                        const specLabel = t(
                            `doctors.specializations.${specKey}`,
                            specKey.charAt(0) + specKey.slice(1).toLowerCase()
                        );
                        return (
                            <option key={doctor.id} value={doctor.id}>
                                {doctor.full_name} ({specLabel})
                            </option>
                        );
                    })}
                </select>
                {errors.doctorId && (
                    <span className="text-xs text-red-500 mt-1 ml-1">{errors.doctorId}</span>
                )}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('booking.select_pet')}
                </label>
                <select
                    value={petId}
                    onChange={e => onPetChange(e.target.value)}
                    className={`w-full rounded-xl border bg-gray-50 p-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all ${
                        errors.petId ? 'border-red-500' : 'border-gray-200'
                    }`}
                    required
                >
                    <option value="">{t('booking.choose_pet')}</option>
                    {Array.isArray(pets) && pets.map(pet => (
                        <option key={pet.id} value={pet.id}>
                            {pet.name} ({pet.species})
                        </option>
                    ))}
                </select>
                {errors.petId && (
                    <span className="text-xs text-red-500 mt-1 ml-1">{errors.petId}</span>
                )}
            </div>
        </div>
    );
};
