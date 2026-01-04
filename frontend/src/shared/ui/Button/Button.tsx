import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'outline';
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
    const baseStyles = 'inline-flex items-center justify-center px-4 py-2 border rounded-md font-medium transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variants = {
        primary: 'border-transparent bg-blue-600 text-white hover:enabled:bg-blue-700 focus:ring-blue-500',
        secondary: 'border-transparent bg-gray-600 text-white hover:enabled:bg-gray-700 focus:ring-gray-500',
        outline: 'border-gray-300 bg-transparent text-gray-700 hover:enabled:bg-gray-100 focus:ring-gray-500',
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