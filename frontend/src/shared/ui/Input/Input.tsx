import { type InputHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className, ...props }, ref) => {
        return (
            <div className="flex flex-col gap-1 text-left w-full">
                {label && (
                    <label className="text-sm font-medium text-gray-700">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={clsx(
                        'w-full px-3 py-2 border rounded-md text-base transition-colors bg-white',
                        'focus:outline-none focus:ring-2',

                        error
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-gray-300 focus:border-blue-600 focus:ring-blue-600/20',

                        className
                    )}
                    {...props}
                />
                {error && (
                    <span className="text-xs text-red-500">
                        {error}
                    </span>
                )}
            </div>
        );
    }
);