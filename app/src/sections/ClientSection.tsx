import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClientTable } from '@/components/ClientTable';
import type { Client, SortConfig, SubscriptionStatus } from '@/types/client';
import { X } from 'lucide-react';

interface ClientSectionProps {
  clients: Client[];
  sortConfig: SortConfig;
  onSort: (key: keyof Client) => void;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  activeFilter?: SubscriptionStatus | 'all';
  onClearFilter?: () => void;
}

const filterLabels: Record<SubscriptionStatus | 'all', string> = {
  'all': 'All Clients',
  'active': 'Active Subscriptions',
  'expiring-soon': 'Expiring Soon',
  'expired': 'Expired Subscriptions',
};

const filterBadgeStyles: Record<SubscriptionStatus | 'all', string> = {
  'all': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  'active': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
  'expiring-soon': 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
  'expired': 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400',
};

export function ClientSection({
  clients,
  sortConfig,
  onSort,
  onEdit,
  onDelete,
  activeFilter = 'all',
  onClearFilter,
}: ClientSectionProps) {
  return (
    <section className="py-6">
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 pb-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Client Records
              </CardTitle>
              {activeFilter !== 'all' && (
                <Badge 
                  variant="secondary"
                  className={`${filterBadgeStyles[activeFilter]} cursor-pointer hover:opacity-80 transition-opacity`}
                  onClick={onClearFilter}
                >
                  {filterLabels[activeFilter]}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              )}
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {clients.length} {clients.length === 1 ? 'client' : 'clients'} found
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ClientTable
            clients={clients}
            sortConfig={sortConfig}
            onSort={onSort}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </CardContent>
      </Card>
    </section>
  );
}
