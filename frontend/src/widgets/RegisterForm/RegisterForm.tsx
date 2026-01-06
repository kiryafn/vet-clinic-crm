import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRegister } from '../../features/auth/register/model/useRegister';
import { Button, Input, Card, Alert } from '../../shared/ui';

export const RegisterForm = () => {
    const { t } = useTranslation();
    const { register, isLoading, error: authError } = useRegister();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [validationError, setValidationError] = useState('');

    const validate = () => {
        if (!email || !password || !fullName) {
            setValidationError(t('auth.validation.required'));
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setValidationError(t('auth.validation.email'));
            return false;
        }
        if (password.length < 6) {
            setValidationError(t('auth.validation.password_length'));
            return false;
        }
        setValidationError('');
        return true;
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        register({
            email,
            password,
            full_name: fullName,
            phone_number: phone,
        });
    };

    const error = validationError || authError;

    return (
        <Card
            title={t('auth.register.title')}
            className="w-full max-w-md mx-auto"
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {error && (
                    <Alert variant="error" title={t('auth.alert.register_failed')}>
                        {error}
                    </Alert>
                )}

                <Input
                    label={t('auth.register.full_name')}
                    value={fullName}
                    onChange={(e) => {
                        setFullName(e.target.value);
                        setValidationError('');
                    }}
                    required
                    placeholder={t('auth.placeholder.name')}
                />
                <Input
                    label={t('auth.register.email')}
                    type="email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setValidationError('');
                    }}
                    required
                    placeholder={t('auth.placeholder.email')}
                />
                <Input
                    label={t('auth.register.phone')}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t('auth.placeholder.phone')}
                />
                <Input
                    label={t('auth.register.password')}
                    type="password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setValidationError('');
                    }}
                    required
                    placeholder={t('auth.placeholder.min_chars')}
                />

                <Button type="submit" isLoading={isLoading} className="w-full">
                    {t('auth.register.submit')}
                </Button>
            </form>
        </Card>
    );
};