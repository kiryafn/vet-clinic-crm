import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';
import './styles.css';

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
    return (
        <button
            className={clsx('btn', `btn-${variant}`, className)}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? 'Loading...' : children}
        </button>
    );
};
