import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  isActive?: boolean;
  onClick?: () => void;
}

const variantStyles = {
  default: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800',
  success: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800',
  warning: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
  danger: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800',
};

const activeStyles = {
  default: 'ring-2 ring-slate-400 ring-offset-2 dark:ring-offset-slate-950',
  success: 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-950',
  warning: 'ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-slate-950',
  danger: 'ring-2 ring-rose-500 ring-offset-2 dark:ring-offset-slate-950',
};

const iconStyles = {
  default: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800',
  success: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50',
  warning: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50',
  danger: 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/50',
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  className,
  variant = 'default',
  isActive = false,
  onClick,
}: StatsCardProps) {
  return (
    <Card 
      onClick={onClick}
      className={cn(
        variantStyles[variant], 
        onClick && 'cursor-pointer',
        'transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
        isActive && activeStyles[variant],
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {title}
        </CardTitle>
        <div className={cn('p-2 rounded-lg', iconStyles[variant])}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          {value.toLocaleString()}
        </div>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
