import { useMemo, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, Views, type View, type Event, type SlotInfo } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS, uk } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import type { Appointment } from '../model/types';
import { AppointmentStatus } from '../model/types';
import { UserRole } from '../../../entities/user/model/types';

const locales = { 'en': enUS, 'uk': uk };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

interface CalendarEvent extends Event {
    resource: Appointment;
}

interface CustomEventProps {
    event: CalendarEvent;
    onCancel?: (id: number) => void;
    userRole?: UserRole;
    view?: View;
}

const CustomEvent = ({ event, onCancel, userRole, view }: CustomEventProps) => {
    const { t } = useTranslation();
    const apt = event.resource;
    const isCancelled = apt.status === AppointmentStatus.CANCELLED;
    const isCompleted = apt.status === AppointmentStatus.COMPLETED;
    const isDoctor = userRole === UserRole.DOCTOR;
    const isMonthView = view === Views.MONTH;
    const isAgendaView = view === Views.AGENDA;

    const handleCancel = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onCancel && !isCancelled && !isCompleted) {
            onCancel(apt.id);
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
            <div className="w-full">
                <div className={`font-semibold text-sm text-gray-900 ${isCompleted ? '' : isCancelled ? 'line-through opacity-70' : ''}`}>
                    <span className="mr-1">{statusEmoji}</span>
                    {(event as any).title || `${apt.pet?.name || 'Pet'} (${apt.pet?.species || ''})`}
                </div>
                {isDoctor ? (
                    <>
                        <div className="text-xs text-gray-600 mt-1">
                            👤 {apt.client?.full_name || 'Unknown Client'}
                        </div>
                        <div className="text-xs text-gray-600">
                            🐾 {apt.pet?.name || 'Pet'} ({apt.pet?.species || ''})
                        </div>
                    </>
                ) : (
                    <div className="text-xs text-gray-600 mt-1">
                        👨‍⚕️ {apt.doctor?.full_name}
                    </div>
                )}
                {apt.reason && !isMonthView && (
                    <div className="text-xs text-gray-500 mt-1">
                        💬 {apt.reason}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div
            className={`h-full flex flex-col p-1.5 text-white relative min-h-[2.5rem] rounded-md transition-all hover:shadow-md hover:-translate-y-0.5 ${eventBgColor} ${isCancelled ? 'grayscale' : ''}`}
        >
            <div className="flex-1 flex flex-col gap-0.5 overflow-hidden">
                <div className={`font-bold flex-shrink-0 overflow-hidden text-ellipsis whitespace-nowrap ${isMonthView ? 'text-xs' : 'text-sm'}`}>
                    <span className="mr-1">{statusEmoji}</span>
                    {(event as any).title || `${apt.pet?.name || 'Pet'} (${apt.pet?.species || ''})`}
                </div>
                {isDoctor ? (
                    <>
                        <div className={`flex-shrink-0 opacity-95 overflow-hidden text-ellipsis whitespace-nowrap ${isMonthView ? 'text-[0.5625rem]' : 'text-xs'}`}>
                            👤 {apt.client?.full_name || 'Unknown Client'}
                        </div>
                        <div className={`flex-shrink-0 opacity-95 overflow-hidden text-ellipsis whitespace-nowrap ${isMonthView ? 'text-[0.5625rem]' : 'text-xs'}`}>
                            🐾 {apt.pet?.name || 'Pet'} ({apt.pet?.species || ''})
                        </div>
                    </>
                ) : (
                    <div className={`flex-shrink-0 opacity-95 overflow-hidden text-ellipsis whitespace-nowrap ${isMonthView ? 'text-[0.5625rem]' : 'text-xs'}`}>
                        👨‍⚕️ {apt.doctor?.full_name}
                    </div>
                )}
                {apt.reason && !isMonthView && (
                    <div className="text-[0.625rem] opacity-85 mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap flex-shrink-0">
                        💬 {apt.reason}
                    </div>
                )}
            </div>
            {onCancel && !isCancelled && !isCompleted && !isMonthView && (
                <button
                    onClick={handleCancel}
                    className="absolute top-1 right-1 bg-white/25 border border-white/35 rounded p-1.5 cursor-pointer flex items-center justify-center transition-all backdrop-blur-sm text-white hover:bg-white/45 hover:border-white/60 hover:scale-110 active:scale-95 w-5 h-5 flex-shrink-0"
                    aria-label={t('appointments.actions.cancel')}
                    title={t('appointments.actions.cancel')}
                >
                    <X size={10} />
                </button>
            )}
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
    onSelectSlot,
    userRole,
}: AppointmentCalendarProps) => {
    const { i18n } = useTranslation();

    const events: CalendarEvent[] = useMemo(() => {
        const isDoctor = userRole === UserRole.DOCTOR;
        return appointments.map(apt => {
            // Для доктора показываем клиента и питомца, для клиента - только питомца
            let title = '';
            if (isDoctor) {
                title = `${apt.client?.full_name || 'Client'}: ${apt.pet?.name || 'Pet'} (${apt.pet?.species || ''})`;
            } else {
                title = `${apt.pet?.name || 'Pet'} (${apt.pet?.species || ''})`;
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
                }
                .rbc-time-view .rbc-event {
                    margin: 0.125rem 0.375rem;
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
        </div>
    );
};
