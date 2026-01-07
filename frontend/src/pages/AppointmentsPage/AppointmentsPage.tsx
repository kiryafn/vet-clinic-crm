import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Views, type View } from 'react-big-calendar';
import { startOfMonth, endOfMonth } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Calendar as CalendarIcon, List, Plus } from 'lucide-react';

import { Header } from '../../widgets/Header/Header';
import { Button, Alert } from '../../shared/ui';
import { appointmentApi } from '../../entities/appointment/api/appointmentApi';
import { AppointmentList } from '../../entities/appointment/ui/AppointmentList';
import { AppointmentCalendar } from '../../entities/appointment/ui/AppointmentCalendar';
import type { Appointment } from '../../entities/appointment/model/types';

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
        let start: Date, end: Date;
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

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pb-12">
            <Header />
            <div className="container mx-auto px-4 py-8 pt-24 max-w-7xl">
                {/* Header Controls */}
                <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                            {t('appointments.page_title')}
                        </h1>
                        <p className="text-lg text-gray-600">{t('appointments.page_subtitle')}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="bg-white p-1.5 rounded-2xl border border-gray-200 flex shadow-lg shadow-gray-200/50">
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                                    viewMode === 'calendar'
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <CalendarIcon size={16} />
                                {t('appointments.actions.calendar_view')}
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                                    viewMode === 'list'
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <List size={16} />
                                {t('appointments.actions.list_view')}
                            </button>
                        </div>
                        <Button
                            onClick={() => navigate('/book-appointment')}
                            className="shadow-lg shadow-indigo-500/30"
                        >
                            <Plus size={18} className="mr-2" />
                            {t('appointments.actions.book')}
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6">
                        <Alert variant="error" title={t('common.error')}>
                            {error}
                        </Alert>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && viewMode === 'calendar' && (
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 h-[800px] flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                            <p className="text-gray-600 font-medium">{t('common.loading')}</p>
                        </div>
                    </div>
                )}

                {/* Calendar View */}
                {viewMode === 'calendar' && !isLoading && (
                    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 md:p-8 h-[800px] md:h-[900px]">
                        <AppointmentCalendar
                            appointments={appointments}
                            view={calendarView}
                            date={date}
                            onViewChange={setCalendarView}
                            onDateChange={setDate}
                            onRangeChange={onRangeChange}
                            onCancelAppointment={handleCancel}
                        />
                    </div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                    <div className="space-y-6">
                        <AppointmentList appointments={appointments} isLoading={isLoading} />

                        {/* Pagination Controls */}
                        {total > 0 && !isLoading && (
                            <div className="flex justify-center items-center gap-4 mt-8">
                                <Button
                                    variant="outline"
                                    disabled={page === 1}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                >
                                    ← {t('common.prev', 'Prev')}
                                </Button>
                                <span className="text-gray-600 font-medium px-4 py-2 bg-white rounded-lg border border-gray-200">
                                    {t('common.page', 'Page')} {page} {t('common.of', 'of')} {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    disabled={page >= totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                >
                                    {t('common.next', 'Next')} →
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};