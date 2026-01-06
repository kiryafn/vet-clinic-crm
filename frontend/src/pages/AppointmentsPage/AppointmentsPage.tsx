import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../widgets/Header/Header';
import { Button, Card } from '../../shared/ui';
import { appointmentApi } from '../../entities/appointment/api/appointmentApi';
import { AppointmentList } from '../../entities/appointment/ui/AppointmentList';
import type { Appointment } from '../../entities/appointment/model/types';

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
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const data = await appointmentApi.getAll();
                setAppointments(data);
            } catch (error) {
                console.error('Failed to fetch appointments', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAppointments();
    }, []);

    // Transform appointments for Big Calendar
    const events = appointments.map(apt => ({
        id: apt.id,
        title: `${apt.pet.name} (${apt.pet.species}) - ${apt.doctor.full_name}`,
        start: new Date(apt.date_time),
        end: new Date(new Date(apt.date_time).getTime() + apt.duration_minutes * 60000),
        resource: apt
    }));

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Header />
            <div className="container mx-auto px-4 py-8 pt-24">
                <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
                        <p className="text-gray-500 mt-2">Manage your schedule and visits</p>
                    </div>
                    <div className="flex gap-3">
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

                {view === 'calendar' ? (
                    <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 h-[800px]">
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: '100%' }}
                            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                            defaultView={Views.MONTH}
                            eventPropGetter={(event) => ({
                                className: 'bg-indigo-600 border-indigo-700 text-white rounded-md shadow-sm text-xs'
                            })}
                        />
                    </div>
                ) : (
                    <AppointmentList appointments={appointments} isLoading={isLoading} />
                )}
            </div>
        </div>
    );
};
