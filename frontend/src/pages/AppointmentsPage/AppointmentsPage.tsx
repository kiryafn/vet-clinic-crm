import { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, Views, type Components } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../widgets/Header/Header';
import { Button, Alert } from '../../shared/ui';
import { appointmentApi } from '../../entities/appointment/api/appointmentApi';
import { AppointmentList } from '../../entities/appointment/ui/AppointmentList';
import { Appointment, AppointmentStatus } from '../../entities/appointment/model/types';

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

export const AppointmentsPage = () => {
    const navigate = useNavigate();
    const [view, setView] = useState<'calendar' | 'list'>('calendar');
    const [calendarView, setCalendarView] = useState(Views.WEEK); // Default to WEEK
    const [date, setDate] = useState(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchAppointments = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await appointmentApi.getAll();
            setAppointments(data);
        } catch (error) {
            console.error('Failed to fetch appointments', error);
            setError('Failed to load appointments');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const handleCancel = async (id: number) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
        try {
            await appointmentApi.cancel(id);
            fetchAppointments(); // Refresh list
        } catch (err) {
            console.error('Failed to cancel', err);
            alert('Failed to cancel appointment');
        }
    };

    // Transform appointments for Big Calendar
    const events = appointments
        .filter(apt => apt.date_time && apt.duration_minutes) // Filter invalid
        .map(apt => {
            const start = new Date(apt.date_time);
            const end = new Date(start.getTime() + (apt.duration_minutes || 45) * 60000);
            return {
                id: apt.id,
                title: `${apt.pet.name} (${apt.pet.species})`,
                start,
                end,
                resource: apt
            };
        });

    // ... EventComponent code ... (unchanged, just mentioning to keep context if I were rewriting whole file, but I will use specific chunks)

    // Fix Min/Max dates to use a valid year (e.g. 1970) to avoid 0-year issues
    const minTime = new Date(1970, 0, 1, 8, 0, 0);
    const maxTime = new Date(1970, 0, 1, 20, 0, 0);

    // ...

    min = { minTime }
    max = { maxTime }

    // Custom Event Component
    const EventComponent = ({ event }: any) => {
        const apt = event.resource as Appointment;
        const isCancelled = apt.status === AppointmentStatus.CANCELLED;

        return (
            <div className={`h-full flex flex-col p-1 text-xs leading-tight overflow-hidden ${isCancelled ? 'opacity-75' : ''}`}>
                <div className="font-bold truncate">{event.title}</div>
                <div className="truncate text-[10px]">{apt.doctor.full_name}</div>
                {apt.reason && <div className="truncate italic opacity-90">{apt.reason}</div>}

                {!isCancelled && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCancel(apt.id);
                        }}
                        className="mt-auto bg-red-100 hover:bg-red-200 text-red-700 px-2 py-0.5 rounded text-[10px] w-fit font-medium transition-colors"
                        title="Cancel Appointment"
                    >
                        Cancel
                    </button>
                )}
                {isCancelled && <div className="mt-auto text-red-100 font-bold uppercase text-[10px]">Cancelled</div>}
            </div>
        );
    };

    const eventPropGetter = (event: any) => {
        const apt = event.resource as Appointment;
        let className = 'border-0 shadow-sm rounded-md transition-all hover:shadow-md';
        let style = {};

        if (apt.status === AppointmentStatus.CANCELLED) {
            className += ' bg-red-500 text-white border-red-600';
            style = { backgroundColor: '#ef4444' }; // Tailwind red-500
        } else if (apt.status === AppointmentStatus.COMPLETED) {
            className += ' bg-green-500 text-white border-green-600';
            style = { backgroundColor: '#22c55e' }; // Tailwind green-500
        } else {
            // Planned
            className += ' bg-indigo-600 text-white border-indigo-700';
            style = { backgroundColor: '#4f46e5' }; // Tailwind indigo-600
        }

        return { className, style };
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Header />
            <div className="container mx-auto px-4 py-8 pt-24">
                <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
                        <p className="text-gray-500 mt-1">Manage your schedule and visits</p>
                    </div>
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="bg-white p-1 rounded-xl border border-gray-200 flex shadow-sm">
                            <button
                                onClick={() => setView('calendar')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'calendar'
                                    ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                Calendar
                            </button>
                            <button
                                onClick={() => setView('list')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'list'
                                    ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                List View
                            </button>
                        </div>
                        <Button
                            onClick={() => navigate('/book-appointment')}
                            className="shadow-lg shadow-indigo-500/20"
                        >
                            + Book Appointment
                        </Button>
                    </div>
                </div>

                {error && <div className="mb-6"><Alert variant="error" title="Error">{error}</Alert></div>}

                {view === 'calendar' ? (
                    <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 h-[800px] flex flex-col">
                        {/* Enhanced Toolbar / Navigation is handled by Big Calendar default toolbar, 
                             but we can customize view props to ensure we can navigate weeks */}
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: '100%' }}
                            // Set views and default view
                            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                            view={calendarView} // Controlled view
                            onView={(v) => setCalendarView(v)}
                            // Controlled date for navigation
                            date={date}
                            onNavigate={(d) => setDate(d)}

                            eventPropGetter={eventPropGetter}
                            components={{
                                event: EventComponent
                            }}
                            min={new Date(1970, 0, 1, 8, 0, 0)} // Start at 8 AM
                            max={new Date(1970, 0, 1, 20, 0, 0)} // End at 8 PM
                            step={15}
                            timeslots={4}
                        />
                    </div>
                ) : (
                    <AppointmentList appointments={appointments} isLoading={isLoading} />
                )}
            </div>
        </div>
    );
};
