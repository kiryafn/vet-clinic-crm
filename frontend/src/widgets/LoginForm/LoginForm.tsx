import { type FormEvent, useState } from 'react';
import { useLogin } from '../../features/auth/login/model/useLogin';
import { Button, Input, Card } from '../../shared/ui';

export const LoginForm = () => {
    const { login, isLoading, error } = useLogin();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        login({ email, password });
    };

    return (
        <Card title="Login" className="w-full max-w-md mx-auto">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <Input
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {error && <div className="text-red-500 text-sm">{error}</div>}
                <Button type="submit" isLoading={isLoading} className="w-full">
                    Sign In
                </Button>
            </form>
        </Card>
    );
};
