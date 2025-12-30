import { LoginForm } from '../../widgets/LoginForm/LoginForm';
import { Header } from '../../widgets/Header/Header';

export const LoginPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col">
            <Header />
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md transform hover:scale-[1.01] transition-all duration-300">
                    <LoginForm />
                </div>
            </div>
        </div>
    );
};
