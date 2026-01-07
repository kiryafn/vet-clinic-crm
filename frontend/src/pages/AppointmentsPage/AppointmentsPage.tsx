import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, dateFnsLocalizer, Views, type View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS, uk } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useTranslation } from 'react-i18next';

import { Header } from '../../widgets/Header/Header';
import { Button, Alert } from '../../shared/ui';
import { appointmentApi } from '../../entities/appointment/api/appointmentApi';
import { AppointmentList } from '../../entities/appointment/ui/AppointmentList';
import { AppointmentStatus, type Appointment } from '../../entities/appointment/model/types';

// --- НАСТРОЙКА ЛОКАЛИЗАЦИИ КАЛЕНДАРЯ ---
const locales = {
    'en': enUS,
    'uk': uk,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

// --- ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ (можно вынести потом) ---

// Компонент события внутри ячейки календаря
const CustomEvent = ({ event, onCancel, t }: any) => {
    const apt = event.resource as Appointment;
    const isCancelled = apt.status === AppointmentStatus.CANCELLED;

    return (
        <div className={`h-full flex flex-col p-1 text-xs leading-tight overflow-hidden ${isCancelled ? 'opacity-60 grayscale' : ''}`}>
            <div className="font-bold truncate">{event.title}</div>

            {/* Для доктора показываем клиента, для клиента - доктора (можно доработать логику) */}
            <div className="truncate text-[10px] opacity-90">
                {apt.doctor?.full_name}
            </div>

            {apt.reason && <div className="truncate italic opacity-75 text-[10px] mt-0.5">{apt.reason}</div>}

            {!isCancelled && (
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Чтобы не открывался просмотр события
                        onCancel(apt.id);
                    }}
                    className="mt-auto bg-white/20 hover:bg-white/40 text-white border border-white/30 px-1.5 py-0.5 rounded text-[10px] w-fit font-medium transition-colors backdrop-blur-sm"
                    title={t('appointments.actions.cancel')}
                >
                    {t('appointments.actions.cancel')}
                </button>
            )}

            {isCancelled && (
                <div className="mt-auto font-bold uppercase text-[9px] tracking-wider opacity-80">
                    {t('appointments.status.CANCELLED')}
                </div>
            )}
        </div>
    );
};

export const AppointmentsPage = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    // Состояние
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
    const [calendarView, setCalendarView] = useState<View>(Views.WEEK);
    const [date, setDate] = useState(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Загрузка данных
    const fetchAppointments = useCallback(async () => {
        setIsLoading(true);
        try {
            // ВАЖНО: Убедись, что путь к API правильный.
            // Если appointmentApi нет в session, импортируй из entities/appointment/api
            const data = await appointmentApi.getAll();
            setAppointments(data);
        } catch (error) {
            console.error('Failed to fetch appointments', error);
            setError(t('appointments.errors.load_failed'));
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    // Обработчик отмены
    const handleCancel = async (id: number) => {
        if (!window.confirm(t('appointments.actions.confirm_cancel'))) return;
        try {
            await appointmentApi.cancel(id);
            fetchAppointments(); // Обновляем список
        } catch (err) {
            console.error('Failed to cancel', err);
            alert(t('appointments.errors.cancel_failed'));
        }
    };

    // Подготовка событий для календаря
    const events = useMemo(() => {
        return appointments
            .filter(apt => apt.date_time) // Фильтруем битые
            .map(apt => {
                const start = new Date(apt.date_time);
                // Если duration нет, ставим 45 мин по умолчанию
                const duration = (apt as any).duration_minutes || 45;
                const end = new Date(start.getTime() + duration * 60000);

                return {
                    id: apt.id,
                    title: `${apt.pet?.name || 'Pet'} (${apt.pet?.species || 'Unknown'})`,
                    start,
                    end,
                    resource: apt
                };
            });
    }, [appointments]);

    // Стилизация событий
    const eventPropGetter = useCallback((event: any) => {
        const apt = event.resource as Appointment;
        let className = 'border-0 shadow-sm rounded-md transition-all hover:shadow-md';
        let style = {};

        switch (apt.status) {
            case AppointmentStatus.CANCELLED:
                style = { backgroundColor: '#ef4444', textDecoration: 'line-through' }; // Red
                break;
            case AppointmentStatus.COMPLETED:
                style = { backgroundColor: '#10b981' }; // Emerald
                break;
            default: // PLANNED
                style = { backgroundColor: '#4f46e5' }; // Indigo
        }

        return { className, style };
    }, []);

    // При изменении языка i18next меняет и локаль календаря
    const currentLocale = i18n.language === 'uk' ? 'uk' : 'en';

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Header />
            <div className="container mx-auto px-4 py-8 pt-24">

                {/* Заголовок и Контролы */}
                <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{t('appointments.page_title')}</h1>
                        <p className="text-gray-500 mt-1">{t('appointments.page_subtitle')}</p>
                    </div>

                    <div className="flex flex-wrap gap-3 items-center">
                        {/* Переключатель Вида */}
                        <div className="bg-white p-1 rounded-xl border border-gray-200 flex shadow-sm">
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'calendar'
                                    ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                {t('appointments.actions.calendar_view')}
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'list'
                                    ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                {t('appointments.actions.list_view')}
                            </button>
                        </div>

                        <Button
                            onClick={() => navigate('/book-appointment')}
                            className="shadow-lg shadow-indigo-500/20"
                        >
                            + {t('appointments.actions.book')}
                        </Button>
                    </div>
                </div>

                {error && <div className="mb-6"><Alert variant="error" title="Error">{error}</Alert></div>}

                {/* Основной Контент */}
                {viewMode === 'calendar' ? (
                    <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 h-[800px] flex flex-col">
                        <Calendar
                            localizer={localizer}
                            culture={currentLocale} // Динамическая смена языка календаря
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: '100%' }}

                            // Views
                            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                            view={calendarView}
                            onView={setCalendarView}

                            // Date Nav
                            date={date}
                            onNavigate={setDate}

                            // Styling & Components
                            eventPropGetter={eventPropGetter}
                            components={{
                                event: (props) => <CustomEvent {...props} onCancel={handleCancel} t={t} />
                            }}

                            // Constraints
                            min={new Date(1970, 0, 1, 8, 0, 0)} // 8:00
                            max={new Date(1970, 0, 1, 20, 0, 0)} // 20:00
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