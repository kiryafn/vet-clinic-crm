import { useMemo, useCallback, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views, type View, type Event, type SlotInfo } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS, uk } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import type { Appointment } from '../model/types';
import { AppointmentStatus } from '../model/types';
import { UserRole } from '../../../entities/user/model/types';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { Button } from '../../../shared/ui';

const locales = { 'en': enUS, 'uk': uk };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

interface CalendarEvent extends Event {
    resource: Appointment;
}

interface CustomEventProps {
    event: CalendarEvent;
    onCancel?: (id: number) => void;
    onComplete?: (id: number) => void;
    onDelete?: (id: number) => void;
    onSelect?: (appointment: Appointment) => void;
    userRole?: UserRole;
    view?: View;
}

const CustomEvent = ({ event, onCancel, onComplete, onDelete, onSelect, userRole, view }: CustomEventProps) => {
    const { t } = useTranslation();
    const apt = event.resource;
    const isCancelled = apt.status === AppointmentStatus.CANCELLED;
    const isCompleted = apt.status === AppointmentStatus.COMPLETED;
    const isDoctor = userRole === UserRole.DOCTOR;
    const isAdmin = userRole === UserRole.ADMIN;
    const isMonthView = view === Views.MONTH;
    const isAgendaView = view === Views.AGENDA;

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onSelect) {
            onSelect(apt);
        }
    };

    const handleCancel = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onCancel && !isCancelled && !isCompleted) {
            onCancel(apt.id);
        }
    };

    const handleComplete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onComplete && !isCancelled && !isCompleted) {
            onComplete(apt.id);
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDelete && isAdmin) {
            onDelete(apt.id);
        }
    };

    // Эмодзи для статусов
    const statusEmoji = isCompleted ? '✅' : isCancelled ? '❌' : '📅';

    // Стили для событий в зависимости от статуса
    const eventBgColor = isCancelled 
        ? 'bg-red-500 border-l-4 border-red-700 opacity-70' 
        : isCompleted 
        ? 'bg-emerald-500 border-l-4 border-emerald-700' 
        : 'bg-indigo-600 border-l-4 border-indigo-800';

    // Для agenda view используем черный текст
    if (isAgendaView) {
        return (
            <div onClick={handleClick} className="w-full cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                <div className={`font-semibold text-sm text-gray-900 ${isCompleted ? '' : isCancelled ? 'line-through opacity-70' : ''}`}>
                    <span className="mr-1">{statusEmoji}</span>
                    {apt.pet?.name || t('appointments.fallbacks.pet')}
                </div>
                {isDoctor ? (
                    <>
                        <div className="text-xs text-gray-600 mt-1">
                            👤 {apt.client?.full_name || t('appointments.fallbacks.client')}
                        </div>
                        <div className="text-xs text-gray-600">
                            🐾 {apt.pet?.name || t('appointments.fallbacks.pet')} ({apt.pet?.species || ''})
                        </div>
                    </>
                ) : (
                    <div className="text-xs text-gray-600 mt-1">
                        👨‍⚕️ {apt.doctor?.full_name || t('appointments.fallbacks.doctor')}
                    </div>
                )}
                {apt.reason && (
                    <div className="text-xs text-gray-500 mt-1">
                        💬 {apt.reason}
                    </div>
                )}
            </div>
        );
    }

    // Для Month view показываем только самое необходимое - очень компактно
    if (isMonthView) {
        return (
            <div
                onClick={handleClick}
                className={`h-full flex items-center px-1.5 py-1 text-white relative min-h-[1.5rem] rounded transition-all cursor-pointer hover:opacity-90 ${eventBgColor} ${isCancelled ? 'grayscale opacity-70' : ''}`}
            >
                <div className="flex-1 flex items-center gap-1 overflow-hidden min-w-0">
                    <span className="text-[0.625rem] flex-shrink-0 leading-none">{statusEmoji}</span>
                    <span className="font-medium text-[0.6875rem] leading-tight overflow-hidden text-ellipsis whitespace-nowrap">
                        {apt.pet?.name || t('appointments.fallbacks.pet')}
                    </span>
                </div>
            </div>
        );
    }

    // Для Week/Day view показываем больше информации, но аккуратно
    return (
        <div
            onClick={handleClick}
            className={`h-full flex flex-col p-2 text-white relative min-h-[3.5rem] rounded transition-all hover:shadow-lg hover:z-10 cursor-pointer ${eventBgColor} ${isCancelled ? 'grayscale opacity-70' : ''}`}
        >
            <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                <div className="font-bold text-xs leading-tight overflow-hidden text-ellipsis whitespace-nowrap flex items-center gap-1">
                    <span className="text-xs">{statusEmoji}</span>
                    <span className="truncate">{apt.pet?.name || t('appointments.fallbacks.pet')}</span>
                </div>
                {apt.pet?.species && (
                    <div className="text-[0.625rem] opacity-90 overflow-hidden text-ellipsis whitespace-nowrap">
                        {apt.pet.species}
                    </div>
                )}
                {isDoctor ? (
                    <div className="text-[0.625rem] opacity-95 overflow-hidden text-ellipsis whitespace-nowrap">
                        👤 {apt.client?.full_name || t('appointments.fallbacks.client')}
                    </div>
                ) : (
                    <div className="text-[0.625rem] opacity-95 overflow-hidden text-ellipsis whitespace-nowrap">
                        👨‍⚕️ {apt.doctor?.full_name || t('appointments.fallbacks.doctor')}
                    </div>
                )}
                {apt.reason && (
                    <div className="text-[0.5625rem] opacity-85 mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap">
                        💬 {apt.reason}
                    </div>
                )}
            </div>
        </div>
    );
};

interface AppointmentCalendarProps {
    appointments: Appointment[];
    view: View;
    date: Date;
    onViewChange: (view: View) => void;
    onDateChange: (date: Date) => void;
    onRangeChange: (range: Date[] | { start: Date; end: Date }) => void;
    onCancelAppointment?: (id: number) => void;
    onCompleteAppointment?: (id: number) => void;
    onDeleteAppointment?: (id: number) => void;
    onSelectSlot?: (slotInfo: SlotInfo) => void;
    userRole?: UserRole;
}

export const AppointmentCalendar = ({
    appointments,
    view,
    date,
    onViewChange,
    onDateChange,
    onRangeChange,
    onCancelAppointment,
    onCompleteAppointment,
    onDeleteAppointment,
    onSelectSlot,
    userRole,
}: AppointmentCalendarProps) => {
    const { i18n, t } = useTranslation();
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    const events: CalendarEvent[] = useMemo(() => {
        const isDoctor = userRole === UserRole.DOCTOR;
        return appointments.map(apt => {
            // Для заголовка используем только имя питомца (для клиента) или имя клиента (для доктора)
            // Полная информация будет в CustomEvent компоненте
            let title = '';
            if (isDoctor) {
                // Для доктора - имя клиента и питомца коротко
                const petName = apt.pet?.name || t('appointments.fallbacks.pet');
                const clientName = apt.client?.full_name || t('appointments.fallbacks.client');
                title = `${clientName}: ${petName}`;
            } else {
                // Для клиента - только имя питомца
                title = apt.pet?.name || t('appointments.fallbacks.pet');
            }
            return {
                id: apt.id,
                title,
                start: new Date(apt.date_time),
                end: new Date(new Date(apt.date_time).getTime() + (apt.duration_minutes || 45) * 60000),
                resource: apt,
            };
        });
    }, [appointments, userRole]);

    const eventPropGetter = useCallback((event: CalendarEvent) => {
        // Стили применяются в CustomEvent через Tailwind
        return {
            className: '',
        };
    }, []);

    const slotPropGetter = useCallback((date: Date) => {
        const now = new Date();
        const isPast = date < now;
        return {
            className: isPast ? 'rbc-slot-past' : '',
        };
    }, []);

    return (
        <div className="h-full w-full [&_.rbc-calendar]:bg-white [&_.rbc-calendar]:rounded-2xl [&_.rbc-calendar]:overflow-hidden">
            <style>{`
                /* Базовые стили для react-big-calendar */
                .rbc-toolbar {
                    padding: 1.5rem;
                    background: white;
                    border-bottom: 1px solid #e5e7eb;
                    margin-bottom: 0;
                }
                .rbc-toolbar button {
                    color: #4b5563;
                    border: 1px solid #d1d5db;
                    background: white;
                    padding: 0.5rem 1rem;
                    border-radius: 0.5rem;
                    font-weight: 500;
                    transition: all 0.2s;
                    margin: 0 0.25rem;
                }
                .rbc-toolbar button:hover {
                    background: #f3f4f6;
                    border-color: #9ca3af;
                }
                .rbc-toolbar button.rbc-active {
                    background: #e0e7ff;
                    color: #4338ca;
                    border-color: #c7d2fe;
                }
                .rbc-toolbar-label {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #1f2937;
                    text-transform: capitalize;
                }
                .rbc-header {
                    padding: 1rem;
                    font-weight: 600;
                    font-size: 0.875rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #4b5563;
                    border-bottom: 1px solid #e5e7eb;
                    background: #f9fafb;
                }
                .rbc-today {
                    background-color: #f0f9ff;
                }
                .rbc-date-cell {
                    text-align: right;
                    padding: 0.5rem 0.75rem;
                }
                .rbc-date-cell > a {
                    color: #6b7280;
                    font-weight: 500;
                    text-decoration: none;
                    font-size: 0.875rem;
                }
                .rbc-date-cell.rbc-now > a {
                    color: #6366f1;
                    font-weight: 700;
                    background: #eef2ff;
                    padding: 0.25rem 0.5rem;
                    border-radius: 0.375rem;
                    display: inline-block;
                }
                .rbc-month-view .rbc-event {
                    margin: 0.125rem 0.25rem;
                    border-radius: 0.375rem;
                    overflow: hidden;
                    border: none;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                }
                .rbc-time-view .rbc-event {
                    margin: 0.125rem 0.375rem;
                    border-radius: 0.5rem;
                    border: none;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .rbc-month-view .rbc-day-bg {
                    min-height: 100px;
                }
                .rbc-month-view .rbc-event {
                    font-size: 0.625rem;
                    line-height: 1.3;
                }
                .rbc-event-content {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                }
                .rbc-agenda-view table {
                    width: 100%;
                }
                .rbc-agenda-date-cell,
                .rbc-agenda-time-cell {
                    padding: 0.875rem 1rem;
                    border-bottom: 1px solid #e5e7eb;
                    white-space: nowrap;
                    vertical-align: top;
                }
                .rbc-agenda-date-cell {
                    font-weight: 600;
                    color: #1f2937;
                    background: #f9fafb;
                    font-size: 0.875rem;
                    width: 12%;
                }
                .rbc-agenda-time-cell {
                    color: #1f2937;
                    font-weight: 500;
                    font-size: 0.875rem;
                    width: 15%;
                }
                .rbc-agenda-event-cell {
                    padding: 0.875rem 1rem;
                    border-bottom: 1px solid #e5e7eb;
                    color: #1f2937;
                    font-size: 0.875rem;
                }
                .rbc-agenda-event-cell * {
                    color: #1f2937 !important;
                }
                .rbc-slot-past {
                    background-color: #f9fafb;
                    opacity: 0.6;
                }
            `}</style>
            <Calendar
                localizer={localizer}
                culture={i18n.language === 'uk' ? 'uk' : 'en'}
                events={events}
                startAccessor="start"
                endAccessor="end"
                view={view}
                onView={onViewChange}
                date={date}
                onNavigate={onDateChange}
                onRangeChange={onRangeChange}
                onSelectSlot={onSelectSlot}
                selectable={!!onSelectSlot}
                eventPropGetter={eventPropGetter}
                slotPropGetter={slotPropGetter}
                views={[Views.MONTH, Views.WEEK, Views.AGENDA]}
                components={{
                    event: (props) => (
                        <CustomEvent
                            event={props.event as CalendarEvent}
                            onCancel={onCancelAppointment}
                            onComplete={onCompleteAppointment}
                            onDelete={onDeleteAppointment}
                            onSelect={(apt) => setSelectedAppointment(apt)}
                            userRole={userRole}
                            view={view}
                        />
                    ),
                }}
                popup
                showMultiDayTimes
                step={15}
                timeslots={4}
                formats={{
                    dayFormat: 'EEEE, MMMM d',
                    weekdayFormat: 'EEEE',
                    dayHeaderFormat: 'EEEE, MMMM d',
                    dayRangeHeaderFormat: ({ start, end }) =>
                        `${format(start, 'MMM d', { locale: locales[i18n.language as keyof typeof locales] })} - ${format(end, 'MMM d', { locale: locales[i18n.language as keyof typeof locales] })}`,
                    timeGutterFormat: 'HH:mm',
                    eventTimeRangeFormat: ({ start, end }) =>
                        `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`,
                }}
            />

            {/* Modal with appointment details */}
            {selectedAppointment && (
                <AppointmentDetailModal
                    appointment={selectedAppointment}
                    onClose={() => setSelectedAppointment(null)}
                    onCancel={onCancelAppointment}
                    onComplete={onCompleteAppointment}
                    onDelete={onDeleteAppointment}
                    userRole={userRole}
                    t={t}
                    i18n={i18n}
                />
            )}
        </div>
    );
};

// Modal component for appointment details
interface AppointmentDetailModalProps {
    appointment: Appointment;
    onClose: () => void;
    onCancel?: (id: number) => void;
    onComplete?: (id: number) => void;
    onDelete?: (id: number) => void;
    userRole?: UserRole;
    t: (key: string, fallback?: string) => string;
    i18n: { language: string };
}

const AppointmentDetailModal = ({
    appointment: apt,
    onClose,
    onCancel,
    onComplete,
    onDelete,
    userRole,
    t,
    i18n,
}: AppointmentDetailModalProps) => {
    const isCancelled = apt.status === AppointmentStatus.CANCELLED;
    const isCompleted = apt.status === AppointmentStatus.COMPLETED;
    const isDoctor = userRole === UserRole.DOCTOR;
    const isAdmin = userRole === UserRole.ADMIN;

    const handleCancel = () => {
        if (onCancel && !isCancelled && !isCompleted) {
            if (window.confirm(t('appointments.actions.confirm_cancel'))) {
                onCancel(apt.id);
                onClose();
            }
        }
    };

    const handleComplete = () => {
        if (onComplete && !isCancelled && !isCompleted) {
            onComplete(apt.id);
            onClose();
        }
    };

    const handleDelete = () => {
        if (onDelete && isAdmin) {
            if (window.confirm(t('appointments.actions.confirm_delete'))) {
                onDelete(apt.id);
                onClose();
            }
        }
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString(i18n.language, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }),
            time: date.toLocaleTimeString(i18n.language, {
                hour: '2-digit',
                minute: '2-digit',
            }),
        };
    };

    const { date: dateStr, time: timeStr } = formatDateTime(apt.date_time);

    const statusColors = {
        planned: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={t('appointments.details.title', 'Appointment Details')}>
            <div className="space-y-6">
                {/* Status */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('appointments.list.headers.status', 'Status')}
                    </label>
                    <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            statusColors[apt.status] || statusColors.planned
                        }`}
                    >
                        {t(`appointments.status.${apt.status}`)}
                    </span>
                </div>

                {/* Date & Time */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('appointments.list.headers.date_time', 'Date & Time')}
                    </label>
                    <div className="text-gray-900 font-medium">{dateStr}</div>
                    <div className="text-gray-600">{timeStr}</div>
                </div>

                {/* Pet */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('appointments.list.headers.pet', 'Pet')}
                    </label>
                    <div className="text-gray-900 font-medium">
                        🐾 {apt.pet?.name || t('appointments.fallbacks.pet')}
                    </div>
                    {apt.pet?.species && (
                        <div className="text-sm text-gray-600 capitalize">{apt.pet.species}</div>
                    )}
                </div>

                {/* Client */}
                {isDoctor && apt.client && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('appointments.list.headers.client', 'Client')}
                        </label>
                        <div className="text-gray-900 font-medium">
                            👤 {apt.client.full_name}
                        </div>
                        {apt.client.phone_number && (
                            <div className="text-sm text-gray-600">{apt.client.phone_number}</div>
                        )}
                    </div>
                )}

                {/* Doctor */}
                {!isDoctor && apt.doctor && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('appointments.list.headers.doctor', 'Doctor')}
                        </label>
                        <div className="text-gray-900 font-medium">
                            👨‍⚕️ {apt.doctor.full_name}
                        </div>
                        {apt.doctor.specialization && (
                            <div className="text-sm text-gray-600">
                                {t(`doctors.specializations.${apt.doctor.specialization}`, apt.doctor.specialization)}
                            </div>
                        )}
                    </div>
                )}

                {/* Reason */}
                {apt.reason && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('appointments.list.headers.reason', 'Reason')}
                        </label>
                        <div className="text-gray-900">{apt.reason}</div>
                    </div>
                )}

                {/* Doctor Notes */}
                {apt.doctor_notes && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('appointments.details.doctor_notes', 'Doctor Notes')}
                        </label>
                        <div className="text-gray-900 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                            {apt.doctor_notes}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                    {isDoctor && onComplete && !isCancelled && !isCompleted && (
                        <Button
                            onClick={handleComplete}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            ✓ {t('appointments.actions.complete', 'Complete')}
                        </Button>
                    )}
                    {onCancel && !isCancelled && !isCompleted && (
                        <Button
                            onClick={handleCancel}
                            variant="outline"
                            className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                            {t('appointments.actions.cancel', 'Cancel')}
                        </Button>
                    )}
                    {isAdmin && onDelete && (
                        <Button
                            onClick={handleDelete}
                            variant="outline"
                            className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                            {t('appointments.actions.delete', 'Delete')}
                        </Button>
                    )}
                    <Button onClick={onClose} variant="outline" className="ml-auto">
                        {t('common.close', 'Close')}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
