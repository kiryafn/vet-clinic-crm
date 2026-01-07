import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface TimeSlotSelectorProps {
    slots: string[];
    selectedSlot: string | null;
    loadingSlots: boolean;
    onSlotSelect: (slot: string) => void;
    error?: string;
}

export const TimeSlotSelector = ({
    slots,
    selectedSlot,
    loadingSlots,
    onSlotSelect,
    error,
}: TimeSlotSelectorProps) => {
    const { t } = useTranslation();

    if (loadingSlots) {
        return (
            <div className="text-gray-500 text-sm">{t('booking.loading_slots')}</div>
        );
    }

    if (slots.length === 0) {
        return (
            <div className="text-gray-500 text-sm italic bg-gray-50 p-4 rounded-lg text-center">
                {t('booking.no_slots')}
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <label className="block text-sm font-medium text-gray-700 mb-3">
                {t('booking.available_slots')}
            </label>
            {error && (
                <span className="text-xs text-red-500 mb-2 block">{error}</span>
            )}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {slots.map(slotIso => {
                    const timeStr = format(new Date(slotIso), 'HH:mm');
                    const isSelected = selectedSlot === slotIso;
                    return (
                        <button
                            key={slotIso}
                            type="button"
                            onClick={() => onSlotSelect(slotIso)}
                            className={`
                                py-2 px-3 rounded-lg text-sm font-medium transition-all text-center
                                ${isSelected
                                    ? 'bg-indigo-600 text-white shadow-md transform scale-105'
                                    : 'bg-white border border-gray-200 text-gray-700 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm'
                                }
                            `}
                        >
                            {timeStr}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
