import { useTranslation } from 'react-i18next';
import { DashboardActionCard } from './DashboardActionCard';

export const DoctorDashboard = () => {
    const { t } = useTranslation();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <DashboardActionCard
                title={t('home.cards.my_schedule')}
                description={t('home.cards.my_schedule_desc')}
                actionText={t('home.cards.my_schedule_action')}
                to="/doctor/schedule"
                colorTheme="indigo"
            />
        </div>
    );
};