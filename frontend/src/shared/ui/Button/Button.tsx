import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    isLoading?: boolean;
}

export const Button = ({
    children,
    variant = 'primary',
    isLoading,
    className,
    disabled,
    ...props
}: ButtonProps) => {
    const baseStyles = 'inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-offset-0 active:scale-[0.98]';

    const variants = {
        primary: 'border border-transparent bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500/30 shadow-lg shadow-indigo-600/20',
        secondary: 'border border-transparent bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-500/30 shadow-lg shadow-gray-800/20',
        outline: 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-200/50 hover:border-gray-300',
        ghost: 'border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-200/30',
    };

    return (
        <button
            className={clsx(
                baseStyles,
                variants[variant],
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? 'Loading...' : children}
        </button>
    );
};