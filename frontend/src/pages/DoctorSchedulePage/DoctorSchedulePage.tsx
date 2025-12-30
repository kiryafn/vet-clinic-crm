import { useEffect, useState } from 'react';
import { api } from '../../shared/api/api';
import { Card } from '../../shared/ui';
import { Header } from '../../widgets/Header/Header';
import { format, isSameDay, parseISO } from 'date-fns';

interface Appointment {
    id: number;
    date_time: string;
    pet: { name: string; species: string };
    user: { full_name: string };
    user_description: string;
}

export const DoctorSchedulePage = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const res = await api.get('/appointments/doctor');
                // Sort by date
                const sorted = res.data.sort((a: any, b: any) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime());
                setAppointments(sorted);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSchedule();
    }, []);

    // Group by day
    const grouped = appointments.reduce((acc, app) => {
        const dateKey = format(parseISO(app.date_time), 'yyyy-MM-dd');
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(app);
        return acc;
    }, {} as Record<string, Appointment[]>);

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Header />
            <div className="container mx-auto px-4 py-8 pt-24">
                <h1 className="text-3xl font-bold mb-8 text-gray-800">My Schedule (Roadmap)</h1>

                {isLoading ? (
                    <p>Loading schedule...</p>
                ) : (
                    <div className="space-y-8 relative border-l-4 border-indigo-200 ml-4 pl-8">
                        {Object.entries(grouped).map(([date, apps]) => (
                            <div key={date} className="relative">
                                {/* Date Marker */}
                                <div className="absolute -left-[45px] top-0 w-6 h-6 rounded-full bg-indigo-500 border-4 border-white shadow-sm"></div>
                                <h2 className="text-2xl font-bold mb-4 text-indigo-900">{format(parseISO(date), 'EEEE, MMMM do')}</h2>

                                <div className="grid gap-4">
                                    {apps.map(app => (
                                        <Card key={app.id} className="flex gap-4 border-l-4 border-l-indigo-400">
                                            <div className="text-indigo-600 font-bold min-w-[80px]">
                                                {format(parseISO(app.date_time), 'HH:mm')}
                                            </div>
                                            <div>
                                                <h3 className="font-bold">{app.pet.name} ({app.pet.species})</h3>
                                                <p className="text-gray-600 text-sm">Owner: {app.user.full_name}</p>
                                                <p className="text-gray-500 mt-2 bg-gray-100 p-2 rounded text-sm">{app.user_description}</p>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {appointments.length === 0 && <p>No upcoming appointments.</p>}
                    </div>
                )}
            </div>
        </div>
    );
};
