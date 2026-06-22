import { StatsCard } from '@/components/StatsCard';
import type { DashboardStats as DashboardStatsType, SubscriptionStatus } from '@/types/client';
import { Users, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface DashboardStatsProps {
  stats: DashboardStatsType;
  activeFilter: SubscriptionStatus | 'all';
  onFilterChange: (filter: SubscriptionStatus | 'all') => void;
}

export function DashboardStats({ stats, activeFilter, onFilterChange }: DashboardStatsProps) {
  return (
    <section className="py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Clients"
          value={stats.totalClients}
          icon={Users}
          description="All registered GPS clients"
          variant="default"
          isActive={activeFilter === 'all'}
          onClick={() => onFilterChange('all')}
        />
        <StatsCard
          title="Active Subscriptions"
          value={stats.activeSubscriptions}
          icon={CheckCircle}
          description="Clients with active GPS service"
          variant="success"
          isActive={activeFilter === 'active'}
          onClick={() => onFilterChange('active')}
        />
        <StatsCard
          title="Expiring Soon"
          value={stats.expiringSoon}
          icon={AlertTriangle}
          description="Clients with ≤30 days remaining"
          variant="warning"
          isActive={activeFilter === 'expiring-soon'}
          onClick={() => onFilterChange('expiring-soon')}
        />
        <StatsCard
          title="Expired"
          value={stats.expired}
          icon={XCircle}
          description="Clients needing renewal"
          variant="danger"
          isActive={activeFilter === 'expired'}
          onClick={() => onFilterChange('expired')}
        />
      </div>
    </section>
  );
}
