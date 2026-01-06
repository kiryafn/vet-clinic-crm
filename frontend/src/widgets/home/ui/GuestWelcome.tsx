import { useTranslation } from 'react-i18next';
import { Card } from '../../../shared/ui';

export const GuestWelcome = () => {
    const { t } = useTranslation();

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="text-center hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                    👨‍⚕️
                </div>
                <h3 className="text-xl font-bold mb-2">{t('home.guest_cards.experts')}</h3>
                <p className="text-gray-600">{t('home.guest_cards.experts_desc')}</p>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                    📅
                </div>
                <h3 className="text-xl font-bold mb-2">{t('home.guest_cards.booking')}</h3>
                <p className="text-gray-600">{t('home.guest_cards.booking_desc')}</p>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                    🐕
                </div>
                <h3 className="text-xl font-bold mb-2">{t('home.guest_cards.history')}</h3>
                <p className="text-gray-600">{t('home.guest_cards.history_desc')}</p>
            </Card>
        </div>
    );
};