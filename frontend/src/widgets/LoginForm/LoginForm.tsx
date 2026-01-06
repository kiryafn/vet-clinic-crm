import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLogin } from '../../features/auth/login/model/useLogin';
import { Button, Input, Card, Alert } from '../../shared/ui';

export const LoginForm = () => {
    const { t } = useTranslation();
    const { login, isLoading, error: authError } = useLogin();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [validationError, setValidationError] = useState('');

    const validate = () => {
        if (!email || !password) {
            setValidationError(t('auth.validation.required'));
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setValidationError(t('auth.validation.email'));
            return false;
        }
        setValidationError('');
        return true;
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        login({ email, password });
    };

    const error = validationError || authError;

    return (
        <Card
            title={t('auth.login.title')}
            className="w-full max-w-md mx-auto"
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {error && (
                    <Alert variant="error" title={t('auth.alert.login_failed')}>
                        {error}
                    </Alert>
                )}

                <Input
                    label={t('auth.login.email')}
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
                    label={t('auth.login.password')}
                    type="password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setValidationError('');
                    }}
                    required
                    placeholder={t('auth.placeholder.password')}
                />

                <Button type="submit" isLoading={isLoading} className="w-full">
                    {t('auth.login.submit')}
                </Button>
            </form>
        </Card>
    );
};