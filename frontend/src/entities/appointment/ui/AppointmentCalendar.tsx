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
import './AppointmentCalendar.css';

const locales = { 'en': enUS, 'uk': uk };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

interface CalendarEvent extends Event {
    resource: Appointment;
}

interface CustomEventProps {
    event: CalendarEvent;
    onCancel?: (id: number) => void;
    userRole?: UserRole;
}

const CustomEvent = ({ event, onCancel, userRole }: CustomEventProps) => {
    const { t } = useTranslation();
    const apt = event.resource;
    const isCancelled = apt.status === AppointmentStatus.CANCELLED;
    const isCompleted = apt.status === AppointmentStatus.COMPLETED;
    const isDoctor = userRole === UserRole.DOCTOR;

    const handleCancel = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onCancel && !isCancelled && !isCompleted) {
            onCancel(apt.id);
        }
    };

    // Эмодзи для статусов
    const statusEmoji = isCompleted ? '✅' : isCancelled ? '❌' : '📅';

    return (
        <div
            className={`appointment-event ${isCancelled ? 'cancelled' : ''} ${isCompleted ? 'completed' : ''}`}
        >
            <div className="event-content">
                <div className="event-title">
                    <span className="mr-1">{statusEmoji}</span>
                    {(event as any).title || `${apt.pet?.name || 'Pet'} (${apt.pet?.species || ''})`}
                </div>
                {isDoctor ? (
                    // Для доктора показываем клиента и питомца
                    <>
                        <div className="event-doctor">
                            👤 {apt.client?.full_name || 'Unknown Client'}
                        </div>
                        <div className="event-doctor">
                            🐾 {apt.pet?.name || 'Pet'} ({apt.pet?.species || ''})
                        </div>
                    </>
                ) : (
                    // Для клиента показываем доктора
                    <div className="event-doctor">
                        👨‍⚕️ {apt.doctor?.full_name}
                    </div>
                )}
                {apt.reason && (
                    <div className="event-reason">
                        💬 {apt.reason}
                    </div>
                )}
            </div>
            {onCancel && !isCancelled && !isCompleted && (
                <button
                    onClick={handleCancel}
                    className="event-cancel-btn"
                    aria-label={t('appointments.actions.cancel')}
                    title={t('appointments.actions.cancel')}
                >
                    <X size={12} />
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
        const status = event.resource.status;
        let className = 'event-planned';
        
        if (status === AppointmentStatus.CANCELLED) {
            className = 'event-cancelled';
        } else if (status === AppointmentStatus.COMPLETED) {
            className = 'event-completed';
        }

        return {
            className,
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
        <div className="appointment-calendar-wrapper">
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
                views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                components={{
                    event: (props) => (
                        <CustomEvent
                            event={props.event as CalendarEvent}
                            onCancel={onCancelAppointment}
                            userRole={userRole}
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
