import { useTranslation } from 'react-i18next';
import { DashboardActionCard } from './DashboardActionCard';

export const AdminDashboard = () => {
    const { t } = useTranslation();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <DashboardActionCard
                title={t('home.cards.manage_doctors')}
                description={t('home.cards.manage_doctors_desc')}
                actionText={t('home.cards.manage_doctors_action')}
                to="/admin/doctors"
                colorTheme="emerald"
            />
        </div>
    );
};