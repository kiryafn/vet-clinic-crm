import { RegisterForm } from '../../widgets/RegisterForm';
import { Header } from '../../widgets/Header';

export const RegisterPage = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <RegisterForm />
            </div>
        </div>
    );
};
