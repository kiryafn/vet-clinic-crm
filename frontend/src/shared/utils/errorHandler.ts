import { useTranslation } from 'react-i18next';

/**
 * Извлекает и форматирует читаемое сообщение об ошибке из ответа FastAPI/Pydantic
 * Поддерживает:
 * - Массив ошибок валидации Pydantic
 * - Строковые сообщения
 * - Network errors
 * - Unknown errors
 */
export const extractErrorMessage = (
    error: any,
    t?: (key: string, fallback?: string) => string
): string => {
    const defaultT = (key: string, fallback?: string) => fallback || key;

    if (!error) {
        return t ? t('common.unknown_error', 'An unknown error occurred') : 'An unknown error occurred';
    }

    // Если это строка, возвращаем её
    if (typeof error === 'string') {
        return error;
    }

    // Если это объект ошибки axios/FastAPI
    if (error?.response?.data) {
        const data = error.response.data;

        // Если detail - это массив (валидационные ошибки FastAPI/Pydantic)
        if (Array.isArray(data.detail)) {
            // Форматируем каждую ошибку красиво
            const messages = data.detail
                .filter((err: any) => err?.msg && typeof err.msg === 'string')
                .map((err: any) => {
                    // Показываем локацию ошибки (например, "body.name", "body.email")
                    const location = Array.isArray(err.loc) 
                        ? err.loc.slice(1).join(' → ').replace(/body\./g, '').replace(/query\./g, 'Query: ')
                        : '';
                    
                    // Форматируем сообщение
                    let message = err.msg;
                    
                    // Специальная обработка ошибок валидации даты
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
                    
                    // Если есть тип ошибки, добавляем его (но не для специально обработанных ошибок)
                    if (err.type && !message.includes('Invalid')) {
                        message = `${message} (${err.type})`;
                    }
                    
                    // Если есть локация, добавляем её красиво
                    // Для birth_date показываем "Date of Birth" вместо "birth_date"
                    const friendlyLocation = location === 'birth_date' 
                        ? (t ? t('pet.form.birth_date', 'Date of Birth') : 'Date of Birth')
                        : location;
                    
                    if (friendlyLocation) {
                        return `${friendlyLocation}: ${message}`;
                    }
                    
                    return message;
                });

            if (messages.length > 0) {
                // Если несколько ошибок, объединяем их с переносами строк
                return messages.length === 1 
                    ? messages[0] 
                    : messages.join('\n');
            }

            return t ? t('common.validation_error', 'Validation error occurred') : 'Validation error occurred';
        }

        // Если detail - это строка
        if (data.detail && typeof data.detail === 'string') {
            return data.detail;
        }

        // Если есть другое поле с сообщением
        if (data.message && typeof data.message === 'string') {
            return data.message;
        }
    }

    // Network errors (нет ответа от сервера)
    if (error?.request && !error?.response) {
        return t 
            ? t('common.network_error', 'Network error: Could not connect to server. Please check your internet connection.')
            : 'Network error: Could not connect to server. Please check your internet connection.';
    }

    // Если есть message
    if (error?.message && typeof error.message === 'string') {
        return error.message;
    }

    // Если error - это объект, пробуем найти любое строковое поле
    if (typeof error === 'object') {
        const possibleFields = ['error', 'msg', 'detail', 'message', 'description'];
        for (const field of possibleFields) {
            if (error[field] && typeof error[field] === 'string') {
                return error[field];
            }
        }
    }

    // Последняя попытка - JSON строка (для отладки в dev режиме)
    if (process.env.NODE_ENV === 'development') {
        try {
            return `Error: ${JSON.stringify(error, null, 2)}`;
        } catch {
            // Ignore
        }
    }

    return t ? t('common.error_occurred', 'An error occurred') : 'An error occurred';
};

/**
 * Хук для использования extractErrorMessage с автоматическим переводом
 */
export const useErrorHandler = () => {
    const { t } = useTranslation();

    return {
        extractError: (error: any) => extractErrorMessage(error, t),
    };
};
