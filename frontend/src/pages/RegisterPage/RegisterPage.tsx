import { RegisterForm } from '../../widgets/RegisterForm/RegisterForm';
import { Header } from '../../widgets/Header/Header';

export const RegisterPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex flex-col">
            <Header />
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md transform hover:scale-[1.01] transition-all duration-300">
                    <RegisterForm />
                </div>
            </div>
        </div>
    );
};
