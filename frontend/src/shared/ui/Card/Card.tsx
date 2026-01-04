import type { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
    children: ReactNode;
    className?: string;
    title?: string;
}

export const Card = ({ children, className, title }: CardProps) => {
    return (
        <div
            className={clsx(
                'bg-white rounded-lg shadow p-6 border border-gray-200',
                className
            )}
        >
            {title && (
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {title}
                </h3>
            )}
            <div>{children}</div>
        </div>
    );
};