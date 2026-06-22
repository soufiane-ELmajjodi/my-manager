import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { SubscriptionStatus } from '@/types/client';

interface StatusBadgeProps {
  status: SubscriptionStatus;
  className?: string;
  showLabel?: boolean;
}

const statusConfig = {
  active: {
    label: 'Active',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800',
    dotClass: 'bg-emerald-500',
  },
  'expiring-soon': {
    label: 'Expiring Soon',
    className: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800',
    dotClass: 'bg-amber-500',
  },
  expired: {
    label: 'Expired',
    className: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800',
    dotClass: 'bg-rose-500',
  },
};

export function StatusBadge({ status, className, showLabel = true }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium px-2.5 py-0.5 transition-colors',
        config.className,
        className
      )}
    >
      <span className={cn('w-2 h-2 rounded-full mr-1.5', config.dotClass)} />
      {showLabel && config.label}
    </Badge>
  );
}
