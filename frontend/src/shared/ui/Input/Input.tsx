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
                        'w-full px-4 py-2 border border-gray-300 rounded-lg text-base transition-all bg-white shadow-sm',
                        'hover:border-gray-400',
                        'focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10',
                        'placeholder:text-gray-400',

                        error
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                            : '',

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