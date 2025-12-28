import { LoginForm } from '../../widgets/LoginForm/LoginForm';
import { Header } from '../../widgets/Header/Header';

export const LoginPage = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <LoginForm />
            </div>
        </div>
    );
};
