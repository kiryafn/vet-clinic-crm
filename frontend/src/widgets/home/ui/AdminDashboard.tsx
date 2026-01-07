import { useTranslation } from 'react-i18next';
import { DashboardActionCard } from './DashboardActionCard';

export const AdminDashboard = () => {
    const { t } = useTranslation();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <DashboardActionCard
                title={t('admin.manage_doctors_title')}
                description={t('admin.manage_doctors_desc')}
                actionText={t('admin.manage_doctors_action')}
                to="/admin/doctors"
                colorTheme="indigo"
            />

            <DashboardActionCard
                title={t('admin.manage_clients_title')}
                description={t('admin.manage_clients_desc')}
                actionText={t('admin.manage_clients_action')}
                to="/admin/clients"
                colorTheme="emerald"
            />

            <DashboardActionCard
                title={t('admin.all_appointments_title')}
                description={t('admin.all_appointments_desc')}
                actionText={t('admin.all_appointments_action')}
                to="/appointments"
                colorTheme="amber"
            />
        </div>
    );
};