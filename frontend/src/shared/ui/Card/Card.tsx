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
                'bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100',
                className
            )}
        >
            {title && (
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {title}
                </h3>
            )}
            <div>{children}</div>
        </div >
    );
};