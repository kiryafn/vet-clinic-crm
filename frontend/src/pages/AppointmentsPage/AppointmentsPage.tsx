import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, dateFnsLocalizer, Views, type View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth } from 'date-fns';
import { enUS, uk } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useTranslation } from 'react-i18next';

import { Header } from '../../widgets/Header/Header';
import { Button, Alert } from '../../shared/ui';
import { appointmentApi } from '../../entities/appointment/api/appointmentApi';
import { AppointmentList } from '../../entities/appointment/ui/AppointmentList';
import { AppointmentStatus, type Appointment } from '../../entities/appointment/model/types';

// --- НАСТРОЙКА ЛОКАЛИЗАЦИИ ---
const locales = { 'en': enUS, 'uk': uk };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// --- КОМПОНЕНТ СОБЫТИЯ ---
const CustomEvent = ({ event, onCancel, t }: any) => {
    const apt = event.resource as Appointment;
    const isCancelled = apt.status === AppointmentStatus.CANCELLED;

    return (
        <div className={`h-full flex flex-col p-1 text-xs leading-tight overflow-hidden ${isCancelled ? 'opacity-60 grayscale' : ''}`}>
            <div className="font-bold truncate">{event.title}</div>
            <div className="truncate text-[10px] opacity-90">{apt.doctor?.full_name}</div>
            {!isCancelled && (
                <button
                    onClick={(e) => { e.stopPropagation(); onCancel(apt.id); }}
                    className="mt-auto bg-white/20 hover:bg-white/40 text-white border border-white/30 px-1.5 py-0.5 rounded text-[10px] w-fit font-medium transition-colors backdrop-blur-sm"
                >
                    {t('appointments.actions.cancel')}
                </button>
            )}
        </div>
    );
};

export const AppointmentsPage = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    // --- STATE ---
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
    const [calendarView, setCalendarView] = useState<View>(Views.MONTH);
    const [date, setDate] = useState(new Date()); // Текущая дата календаря

    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Pagination State for List View
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    // Date Range State for Calendar View
    const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
        start: startOfMonth(new Date()),
        end: endOfMonth(new Date())
    });

    // --- FETCH DATA ---
    const fetchAppointments = useCallback(async () => {
        setIsLoading(true);
        try {
            let params = {};

            if (viewMode === 'calendar') {
                // В режиме календаря грузим диапазон (например, месяц)
                // react-big-calendar иногда запрашивает дни с предыдущего месяца, поэтому берем с запасом
                params = {
                    start_date: dateRange.start.toISOString(),
                    end_date: dateRange.end.toISOString()
                };
            } else {
                // В режиме списка грузим пагинацию
                params = {
                    page: page,
                    limit: limit
                };
            }

            const data = await appointmentApi.getAll(params);
            setAppointments(data.items);
            setTotal(data.total);
        } catch (error) {
            console.error('Failed to fetch appointments', error);
            setError(t('appointments.errors.load_failed'));
        } finally {
            setIsLoading(false);
        }
    }, [viewMode, page, dateRange, t]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    // --- HANDLERS ---
    const handleCancel = async (id: number) => {
        if (!window.confirm(t('appointments.actions.confirm_cancel'))) return;
        try {
            await appointmentApi.cancel(id);
            fetchAppointments();
        } catch (err) {
            alert(t('appointments.errors.cancel_failed'));
        }
    };

    // Callback календаря при смене месяца/недели
    const onRangeChange = useCallback((range: Date[] | { start: Date; end: Date }) => {
        let start, end;
        if (Array.isArray(range)) {
            // Если View = Day | Week (приходит массив дней)
            start = range[0];
            end = range[range.length - 1];
            // Добавляем конец дня
            end.setHours(23, 59, 59);
        } else {
            // Если View = Month
            start = range.start;
            end = range.end;
        }
        setDateRange({ start, end });
    }, []);

    const events = useMemo(() => {
        return appointments.map(apt => ({
            id: apt.id,
            title: `${apt.pet?.name || 'Pet'} (${apt.pet?.species || ''})`,
            start: new Date(apt.date_time),
            end: new Date(new Date(apt.date_time).getTime() + 45 * 60000),
            resource: apt
        }));
    }, [appointments]);

    const eventPropGetter = useCallback((event: any) => {
        const status = event.resource.status;
        let bg = '#4f46e5';
        if (status === AppointmentStatus.CANCELLED) bg = '#ef4444';
        if (status === AppointmentStatus.COMPLETED) bg = '#10b981';
        return { style: { backgroundColor: bg } };
    }, []);

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Header />
            <div className="container mx-auto px-4 py-8 pt-24">

                {/* Header Controls */}
                <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{t('appointments.page_title')}</h1>
                        <p className="text-gray-500">{t('appointments.page_subtitle')}</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="bg-white p-1 rounded-xl border flex shadow-sm">
                            <button onClick={() => setViewMode('calendar')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'calendar' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600'}`}>{t('appointments.actions.calendar_view')}</button>
                            <button onClick={() => setViewMode('list')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600'}`}>{t('appointments.actions.list_view')}</button>
                        </div>
                        <Button onClick={() => navigate('/book-appointment')}>+ {t('appointments.actions.book')}</Button>
                    </div>
                </div>

                {error && <div className="mb-6"><Alert variant="error" title="Error">{error}</Alert></div>}

                {/* --- CALENDAR VIEW --- */}
                {viewMode === 'calendar' ? (
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 h-[800px]">
                        <Calendar
                            localizer={localizer}
                            culture={i18n.language === 'uk' ? 'uk' : 'en'}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: '100%' }}
                            views={[Views.MONTH, Views.WEEK, Views.DAY]}
                            view={calendarView}
                            onView={setCalendarView}
                            date={date}
                            onNavigate={setDate}
                            onRangeChange={onRangeChange} // <--- ВОТ ТУТ МАГИЯ ПОДГРУЗКИ
                            eventPropGetter={eventPropGetter}
                            components={{ event: (p) => <CustomEvent {...p} onCancel={handleCancel} t={t} /> }}
                        />
                    </div>
                ) : (
                    /* --- LIST VIEW --- */
                    <div className="space-y-6">
                        <AppointmentList appointments={appointments} isLoading={isLoading} />

                        {/* Pagination Controls */}
                        {total > 0 && (
                            <div className="flex justify-center items-center gap-4 mt-8">
                                <Button
                                    variant="outline"
                                    disabled={page === 1 || isLoading}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                >
                                    ← Prev
                                </Button>
                                <span className="text-gray-600 font-medium">
                                    Page {page} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    disabled={page >= totalPages || isLoading}
                                    onClick={() => setPage(p => p + 1)}
                                >
                                    Next →
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};