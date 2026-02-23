import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: string | number;
    change?: number; // percentage change
    loading?: boolean;
    icon?: React.ElementType; // Optional icon
    trendLabel?: string; // e.g. "From last week"
}

export default function KPICard({ title, value, change, loading, icon: Icon, trendLabel = "From last week" }: KPICardProps) {
    if (loading) {
        return (
            <div className="p-6 bg-white rounded-2xl shadow-sm animate-pulse border border-gray-100 h-full">
                <div className="flex justify-between">
                    <div className="h-4 bg-gray-100 rounded w-1/3 mb-4"></div>
                    <div className="h-8 w-8 bg-gray-100 rounded-lg"></div>
                </div>
                <div className="h-10 bg-gray-100 rounded w-1/2 mt-2"></div>
            </div>
        );
    }

    const isPositive = change !== undefined && change > 0;
    const isNegative = change !== undefined && change < 0;
    const isNeutral = change === 0;

    return (
        <div className="p-6 bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05),0_10px_20px_-2px_rgba(0,0,0,0.02)] border border-gray-50 flex flex-col justify-between h-full transition-all hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-gray-500 font-medium text-sm tracking-wide">{title}</h3>
                    <p className="text-3xl font-extrabold text-gray-800 mt-2">{value}</p>
                </div>
                {Icon && (
                    <div className={`p-3 rounded-xl ${isPositive || isNeutral ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'}`}>
                        <Icon size={24} strokeWidth={1.5} />
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 mt-auto">
                {change !== undefined && (
                    <span className={`
            inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold
            ${isPositive ? 'text-green-700 bg-green-50' : isNegative ? 'text-red-700 bg-red-50' : 'text-gray-600 bg-gray-100'}
          `}>
                        {isPositive && <ArrowUpRight size={14} className="mr-1" />}
                        {isNegative && <ArrowDownRight size={14} className="mr-1" />}
                        {isNeutral && <Minus size={14} className="mr-1" />}
                        {Math.abs(change).toFixed(0)}%
                    </span>
                )}
                <span className="text-xs text-gray-400 font-medium">{trendLabel}</span>
            </div>
        </div>
    );
}
