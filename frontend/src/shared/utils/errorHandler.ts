import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

export const extractErrorMessage = (
    error: any,
    t?: TFunction
): string => {

    if (!error) {
        return t ? t('common.unknown_error', 'An unknown error occurred') : 'An unknown error occurred';
    }

    if (typeof error === 'string') {
        return error;
    }

    if (error?.response?.data) {
        const data = error.response.data;

        if (Array.isArray(data.detail)) {
            const messages = data.detail
                .filter((err: any) => err?.msg && typeof err.msg === 'string')
                .map((err: any) => {
                    const location = Array.isArray(err.loc)
                        ? err.loc.slice(1).join(' → ').replace(/body\./g, '').replace(/query\./g, 'Query: ')
                        : '';

                    let message = err.msg;

                    if (message.includes('month value is outside expected range')) {
                        message = t
                            ? t('pet.validation.invalid_month', 'Invalid month. Month must be between 1 and 12.')
                            : 'Invalid month. Month must be between 1 and 12.';
                    } else if (message.includes('day value is outside expected range')) {
                        message = t
                            ? t('pet.validation.invalid_day', 'Invalid day. Please check the date.')
                            : 'Invalid day. Please check the date.';
                    } else if (message.includes('year value is outside expected range') || message.includes('date')) {
                        message = t
                            ? t('pet.validation.invalid_date_format', 'Invalid date format. Please use YYYY-MM format.')
                            : 'Invalid date format. Please use YYYY-MM format.';
                    }

                    if (err.type && !message.includes('Invalid')) {
                        message = `${message} (${err.type})`;
                    }

                    const friendlyLocation = location === 'birth_date'
                        ? (t ? t('pet.form.birth_date', 'Date of Birth') : 'Date of Birth')
                        : location;

                    if (friendlyLocation) {
                        return `${friendlyLocation}: ${message}`;
                    }

                    return message;
                });

            if (messages.length > 0) {
                return messages.length === 1
                    ? messages[0]
                    : messages.join('\n');
            }

            return t ? t('common.validation_error', 'Validation error occurred') : 'Validation error occurred';
        }

        if (data.detail && typeof data.detail === 'string') {
            return data.detail;
        }

        if (data.message && typeof data.message === 'string') {
            return data.message;
        }
    }

    if (error?.request && !error?.response) {
        return t
            ? t('common.network_error', 'Network error: Could not connect to server. Please check your internet connection.')
            : 'Network error: Could not connect to server. Please check your internet connection.';
    }

    if (error?.message && typeof error.message === 'string') {
        return error.message;
    }

    if (typeof error === 'object') {
        const possibleFields = ['error', 'msg', 'detail', 'message', 'description'];
        for (const field of possibleFields) {
            if (error[field] && typeof error[field] === 'string') {
                return error[field];
            }
        }
    }

    if (import.meta.env.DEV) {
        try {
            return `Error: ${JSON.stringify(error, null, 2)}`;
        } catch {
            // Ignore
        }
    }

    return t ? t('common.error_occurred', 'An error occurred') : 'An error occurred';
};


export const useErrorHandler = () => {
    const { t } = useTranslation();

    return {
        extractError: (error: any) => extractErrorMessage(error, t),
    };
};