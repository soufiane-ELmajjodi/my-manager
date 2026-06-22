import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import { cn } from '@/lib/utils';
import type { Client, SortConfig } from '@/types/client';
import { Pencil, Trash2, ArrowUpDown } from 'lucide-react';

interface ClientTableProps {
  clients: Client[];
  sortConfig: SortConfig;
  onSort: (key: keyof Client) => void;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

const headerClass = 'font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors';
const cellClass = 'text-slate-600 dark:text-slate-400';

export function ClientTable({
  clients,
  sortConfig,
  onSort,
  onEdit,
  onDelete,
}: ClientTableProps) {
  const SortableHeader = ({
    column,
    children,
    className
  }: {
    column: keyof Client;
    children: React.ReactNode;
    className?: string;
  }) => (
    <TableHead
      className={cn(headerClass, className)}
      onClick={() => onSort(column)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className={cn(
          'h-3.5 w-3.5 transition-colors',
          sortConfig.key === column ? 'text-primary' : 'text-slate-400'
        )} />
      </div>
    </TableHead>
  );

  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">
          No clients found
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Try adjusting your search or add a new client.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/50 dark:bg-slate-900/50">
            <SortableHeader column="clientName">Client</SortableHeader>
            <TableHead className={headerClass}>IMEI</TableHead>
            <TableHead className={headerClass}>GPS Number</TableHead>
            <SortableHeader column="installationDate">Install Date</SortableHeader>
            <TableHead className={headerClass}>Duration</TableHead>
            <SortableHeader column="expirationDate">Expires</SortableHeader>
            <SortableHeader column="remainingDays">Remaining</SortableHeader>
            <SortableHeader column="status">Status</SortableHeader>
            <TableHead className={headerClass}>Phone</TableHead>
            <TableHead className={headerClass + ' text-right'}>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client, index) => (
            <TableRow
              key={client.id}
              className={cn(
                'group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50',
                index % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50/50 dark:bg-slate-900/30'
              )}
            >
              <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                {client.clientName}
              </TableCell>
              <TableCell className={cellClass + ' font-mono text-xs'}>
                {client.imei}
              </TableCell>
              <TableCell className={cellClass + ' font-mono text-xs'}>
                {client.gpsNumber}
              </TableCell>
              <TableCell className={cellClass}>
                {new Date(client.installationDate).toLocaleDateString()}
              </TableCell>
              <TableCell className={cellClass}>
                {client.durationMonths} months
              </TableCell>
              <TableCell className={cellClass}>
                {new Date(client.expirationDate).toLocaleDateString()}
              </TableCell>
              <TableCell className={cn(
                cellClass,
                'font-medium',
                client.remainingDays < 0 && 'text-rose-600 dark:text-rose-400',
                client.remainingDays >= 0 && client.remainingDays <= 30 && 'text-amber-600 dark:text-amber-400',
                client.remainingDays > 30 && 'text-emerald-600 dark:text-emerald-400'
              )}>
                {client.remainingDays < 0
                  ? `${Math.abs(client.remainingDays)} days ago`
                  : `${client.remainingDays} days`
                }
              </TableCell>
              <TableCell>
                <StatusBadge status={client.status} />
              </TableCell>
              <TableCell className={cellClass}>
                {client.phoneNumber}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                    onClick={() => onEdit(client)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    onClick={() => onDelete(client)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
