import { useTranslation } from 'react-i18next';
import { AppointmentStatus, type Appointment } from '../model/types';

interface AppointmentListProps {
    appointments: Appointment[];
    isLoading: boolean;
}

export const AppointmentList = ({ appointments, isLoading }: AppointmentListProps) => {
    const { t, i18n } = useTranslation();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (appointments.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {t('appointments.list.empty_title')}
                </h3>
                <p className="text-gray-500">
                    {t('appointments.list.empty_desc')}
                </p>
            </div>
        );
    }

    // Заменили объект на switch case - это надежнее и понятнее
    const getStatusBadge = (status: AppointmentStatus) => {
        switch (status) {
            case AppointmentStatus.PLANNED:
                return 'bg-blue-50 text-blue-700 ring-blue-600/20';
            case AppointmentStatus.COMPLETED:
                return 'bg-green-50 text-green-700 ring-green-600/20';
            case AppointmentStatus.CANCELLED:
                return 'bg-red-50 text-red-700 ring-red-600/20';
            default:
                return 'bg-gray-50 text-gray-700 ring-gray-600/20';
        }
    };

    // Нативные функции форматирования без библиотек
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(i18n.language, {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString(i18n.language, {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                {t('appointments.list.headers.date_time')}
                            </th>
                            <th className="px-6 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                {t('appointments.list.headers.client')}
                            </th>
                            <th className="px-6 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                {t('appointments.list.headers.pet')}
                            </th>
                            <th className="px-6 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                {t('appointments.list.headers.doctor')}
                            </th>
                            <th className="px-6 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                {t('appointments.list.headers.status')}
                            </th>
                            <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                                {t('appointments.list.headers.reason')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {appointments.map((apt) => (
                            <tr key={apt.id} className="group hover:bg-gray-50/50 transition-all duration-200">
                                {/* Дата и Время */}
                                <td className="px-8 py-5">
                                    <div className="font-bold text-gray-900 capitalize">
                                        {formatDate(apt.date_time)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {formatTime(apt.date_time)}
                                    </div>
                                </td>

                                {/* Клієнт */}
                                <td className="px-6 py-5">
                                    <div className="font-medium text-gray-900">
                                        {apt.client?.full_name || t('common.unknown')}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {apt.client?.phone_number || '-'}
                                    </div>
                                </td>

                                {/* Тварина */}
                                <td className="px-6 py-5">
                                    <div className="font-medium text-gray-900">{apt.pet.name}</div>
                                    <div className="text-xs text-gray-500 capitalize">
                                        {apt.pet.species.toLowerCase()}
                                    </div>
                                </td>

                                {/* Лікар */}
                                <td className="px-6 py-5">
                                    <div className="font-medium text-gray-900">{apt.doctor.full_name}</div>
                                    {apt.doctor.specialization && (
                                        <div className="text-xs text-gray-500">
                                            {t(`doctors.specializations.${apt.doctor.specialization}`, apt.doctor.specialization.charAt(0) + apt.doctor.specialization.slice(1).toLowerCase())}
                                        </div>
                                    )}
                                </td>

                                {/* Статус */}
                                <td className="px-6 py-5">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${getStatusBadge(apt.status)}`}>
                                        {t(`appointments.status.${apt.status}`)}
                                    </span>
                                </td>

                                {/* Причина */}
                                <td className="px-8 py-5 text-right text-sm text-gray-600">
                                    {apt.reason || '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};