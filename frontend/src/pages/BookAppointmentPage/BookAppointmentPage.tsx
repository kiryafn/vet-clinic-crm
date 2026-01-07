import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../widgets/Header/Header';
import { Button, Input, Card, Alert } from '../../shared/ui';
import { useBookAppointment } from '../../features/appointment/book/model/useBookAppointment';
import { DoctorPetSelector } from '../../features/appointment/book/ui/DoctorPetSelector';
import { TimeSlotSelector } from '../../features/appointment/book/ui/TimeSlotSelector';

export const BookAppointmentPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const {
        doctors,
        pets,
        slots,
        doctorId,
        petId,
        date,
        selectedSlot,
        description,
        error,
        isSubmitting,
        isFetchingData,
        loadingSlots,
        validationErrors,
        setDoctorId,
        setPetId,
        setDate,
        setSelectedSlot,
        setDescription,
        handleSubmit,
    } = useBookAppointment();


    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <div className="flex-1 container mx-auto px-4 py-8 pt-24 flex justify-center">
                <Card title={t('home.cards.book_appointment')} className="w-full max-w-2xl">
                    {error && (
                        <div className="mb-6">
                            <Alert variant="error" title={t('common.error')}>
                                {error}
                            </Alert>
                        </div>
                    )}

                    {isFetchingData ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            {/* Doctor & Pet Selection */}
                            <DoctorPetSelector
                                doctors={doctors}
                                pets={pets}
                                doctorId={doctorId}
                                petId={petId}
                                onDoctorChange={setDoctorId}
                                onPetChange={setPetId}
                                errors={{
                                    doctorId: validationErrors.doctorId,
                                    petId: validationErrors.petId,
                                }}
                            />

                            {/* Date Selection */}
                            <Input
                                label={t('booking.date')}
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                error={validationErrors.date}
                                required
                                min={new Date().toISOString().split('T')[0]}
                            />

                            {/* Slot Selection */}
                            {doctorId && date && (
                                <TimeSlotSelector
                                    slots={slots}
                                    selectedSlot={selectedSlot}
                                    loadingSlots={loadingSlots}
                                    onSlotSelect={setSelectedSlot}
                                    error={validationErrors.slot}
                                />
                            )}

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('booking.reason')}
                                </label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className={`w-full rounded-xl border bg-gray-50 p-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all min-h-[100px] ${
                                        validationErrors.description ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                    placeholder={t('booking.reason_placeholder')}
                                    maxLength={500}
                                />
                                {validationErrors.description && (
                                    <span className="text-xs text-red-500 mt-1 ml-1">
                                        {validationErrors.description}
                                    </span>
                                )}
                                <div className="text-xs text-gray-500 mt-1 text-right">
                                    {description.length}/500
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/')}
                                    className="flex-1"
                                >
                                    {t('booking.cancel')}
                                </Button>
                                <Button
                                    type="submit"
                                    isLoading={isSubmitting}
                                    disabled={!selectedSlot || !petId}
                                    className="flex-1 shadow-lg shadow-indigo-500/20"
                                >
                                    {t('booking.confirm')}
                                </Button>
                            </div>
                        </form>
                    )}
                </Card>
            </div>
        </div>
    );
};
