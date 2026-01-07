import { useTranslation } from 'react-i18next';
import { DashboardActionCard } from './DashboardActionCard';

export const ClientDashboard = () => {
    const { t } = useTranslation();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <DashboardActionCard
                title={t('home.cards.my_pets')}
                description={t('home.cards.my_pets_desc')}
                actionText={t('home.cards.my_pets_action')}
                to="/my-pets"
                colorTheme="amber"
            />

            <DashboardActionCard
                title={t('home.cards.add_pet')}
                description={t('home.cards.add_pet_desc')}
                actionText={t('home.cards.add_pet_action')}
                to="/add-pet"
                colorTheme="indigo"
            />

            <DashboardActionCard
                title={t('home.cards.book_appointment')}
                description={t('home.cards.book_appointment_desc')}
                actionText={t('home.cards.book_appointment_action')}
                to="/book-appointment"
                colorTheme="pink"
            />

            <DashboardActionCard
                title={t('home.cards.my_appointments')}
                description={t('home.cards.my_appointments_desc')}
                actionText={t('home.cards.my_schedule_action', 'View Table')}
                to="/appointments"
                colorTheme="amber"
            />
        </div>
    );
};