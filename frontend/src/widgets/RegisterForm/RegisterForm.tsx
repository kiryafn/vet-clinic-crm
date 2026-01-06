import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next'; // <--- Импортируем хук
import { useRegister } from '../../features/auth/register/model/useRegister';
import { Button, Input, Card } from '../../shared/ui';

export const RegisterForm = () => {
    const { t } = useTranslation();
    const { register, isLoading, error } = useRegister();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        register({
            email,
            password,
            full_name: fullName,
            phone_number: phone,
        });
    };

    return (
        <Card
            title={t('auth.register.title')}
            className="w-full max-w-md mx-auto"
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                    label={t('auth.register.full_name')}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                />
                <Input
                    label={t('auth.register.email')} // "Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <Input
                    label={t('auth.register.phone')}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />
                <Input
                    label={t('auth.register.password')}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                {error && <div className="text-red-500 text-sm">{error}</div>}

                <Button type="submit" isLoading={isLoading} className="w-full">
                    {t('auth.register.submit')}
                </Button>
            </form>
        </Card>
    );
};