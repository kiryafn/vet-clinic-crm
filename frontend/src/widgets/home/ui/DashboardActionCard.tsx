import { Link } from 'react-router-dom';
import { Card } from '../../../shared/ui';

export type CardColorTheme = 'emerald' | 'indigo' | 'amber' | 'pink' | 'gray';

interface DashboardActionCardProps {
    title: string;
    description: string;
    actionText?: string;
    to?: string;
    colorTheme?: CardColorTheme;
    isDisabled?: boolean;
}

export const DashboardActionCard = ({
    title,
    description,
    actionText,
    to,
    colorTheme = 'indigo',
    isDisabled = false,
}: DashboardActionCardProps) => {

    const colorStyles = {
        emerald: {
            border: 'border-l-emerald-500',
            title: 'text-emerald-900',
            btn: 'text-emerald-600',
        },
        indigo: {
            border: 'border-l-indigo-600',
            title: 'text-indigo-900',
            btn: 'text-indigo-600',
        },
        amber: {
            border: 'border-l-amber-500',
            title: 'text-amber-900',
            btn: 'text-amber-600',
        },
        pink: {
            border: 'border-l-pink-500',
            title: 'text-pink-900',
            btn: 'text-pink-600',
        },
        gray: {
            border: 'border-l-gray-400',
            title: 'text-gray-500',
            btn: 'text-gray-400',
        },
    };

    const theme = colorStyles[colorTheme];

    const Content = (
        <Card
            className={`h-full transition-all duration-300 border-l-4 ${theme.border} 
            ${isDisabled ? 'bg-gray-50/50 opacity-75 cursor-not-allowed' : 'hover:shadow-2xl group-hover:-translate-y-1'}`}
        >
            <h3 className={`text-2xl font-bold mb-3 ${theme.title}`}>{title}</h3>
            <p className="text-gray-600 mb-6">{description}</p>

            {actionText && (
                <div className={`${theme.btn} font-semibold ${!isDisabled && 'group-hover:translate-x-2'} transition-transform inline-flex items-center`}>
                    {actionText} {isDisabled ? '' : '→'}
                </div>
            )}
        </Card>
    );

    if (to && !isDisabled) {
        return (
            <Link to={to} className="group block h-full">
                {Content}
            </Link>
        );
    }

    return <div className="group h-full">{Content}</div>;
};