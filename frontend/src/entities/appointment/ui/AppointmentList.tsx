import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { AppointmentStatus, type Appointment } from '../model/types';
import { Button } from '../../../shared/ui';

interface AppointmentListProps {
    appointments: Appointment[];
    isLoading: boolean;
}

export const AppointmentList = ({ appointments, isLoading }: AppointmentListProps) => {
    const { t } = useTranslation();

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
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No appointments yet</h3>
                <p className="text-gray-500">Book your first visit to see it here!</p>
            </div>
        );
    }

    const getStatusBadge = (status: AppointmentStatus) => {
        const styles = {
            [AppointmentStatus.PLANNED]: 'bg-blue-50 text-blue-700 ring-blue-600/20',
            [AppointmentStatus.COMPLETED]: 'bg-green-50 text-green-700 ring-green-600/20',
            [AppointmentStatus.CANCELLED]: 'bg-red-50 text-red-700 ring-red-600/20',
        };
        return styles[status] || 'bg-gray-50 text-gray-700 ring-gray-600/20';
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                            <th className="px-6 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pet</th>
                            <th className="px-6 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Doctor</th>
                            <th className="px-6 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Reason</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {appointments.map((apt) => (
                            <tr key={apt.id} className="group hover:bg-gray-50/50 transition-all duration-200">
                                <td className="px-8 py-5">
                                    <div className="font-bold text-gray-900">
                                        {format(new Date(apt.date_time), 'MMM d, yyyy')}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {format(new Date(apt.date_time), 'HH:mm')}
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="font-medium text-gray-900">{apt.pet.name}</div>
                                    <div className="text-xs text-gray-500">{apt.pet.species}</div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="font-medium text-gray-900">{apt.doctor.full_name}</div>
                                    <div className="text-xs text-gray-500">{apt.doctor.specialization?.name || apt.doctor.specialization}</div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${getStatusBadge(apt.status)}`}>
                                        {apt.status}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-right text-sm text-gray-600">
                                    {apt.reason || apt.user_description || '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
