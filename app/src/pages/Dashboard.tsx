import { useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { DashboardStats } from '@/sections/DashboardStats';
import { ClientSection } from '@/sections/ClientSection';
import { ClientDialog } from '@/components/ClientDialog';
import { DeleteDialog } from '@/components/DeleteDialog';
import { useClients } from '@/hooks/useClients';
import { useTheme } from '@/hooks/useTheme';
import { exportToExcel } from '@/lib/export';
import type { Client, ClientFormData } from '@/types/client';
import { toast } from 'sonner';

export function Dashboard() {
    const {
        filteredClients,
        stats,
        searchQuery,
        setSearchQuery,
        statusFilter,
        handleStatusFilterChange,
        sortConfig,
        handleSort,
        createClient,
        updateClient,
        deleteClient,
        refreshAll,
    } = useClients();

    const { isDark, toggleTheme } = useTheme();

    // Dialog states
    const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');

    // Handle add client
    const handleAddClick = useCallback(() => {
        setSelectedClient(null);
        setDialogMode('add');
        setIsClientDialogOpen(true);
    }, []);

    // Handle edit client
    const handleEditClick = useCallback((client: Client) => {
        setSelectedClient(client);
        setDialogMode('edit');
        setIsClientDialogOpen(true);
    }, []);

    // Handle delete client
    const handleDeleteClick = useCallback((client: Client) => {
        setSelectedClient(client);
        setIsDeleteDialogOpen(true);
    }, []);

    // Handle client form submission
    const handleClientSubmit = useCallback((formData: ClientFormData) => {
        if (dialogMode === 'add') {
            createClient(formData);
            toast.success('Client added successfully', {
                description: `${formData.clientName} has been added to the system.`,
            });
        } else if (selectedClient) {
            updateClient(selectedClient.id, formData);
            toast.success('Client updated successfully', {
                description: `${formData.clientName}'s information has been updated.`,
            });
        }
    }, [dialogMode, selectedClient, createClient, updateClient]);

    // Handle delete confirmation
    const handleDeleteConfirm = useCallback(() => {
        if (selectedClient) {
            deleteClient(selectedClient.id);
            toast.success('Client deleted successfully', {
                description: `${selectedClient.clientName} has been removed from the system.`,
            });
            setIsDeleteDialogOpen(false);
            setSelectedClient(null);
        }
    }, [selectedClient, deleteClient]);

    // Handle export
    const handleExport = useCallback(() => {
        exportToExcel(filteredClients);
        toast.success('Export completed', {
            description: `Exported ${filteredClients.length} clients to Excel.`,
        });
    }, [filteredClients]);

    // Handle refresh
    const handleRefresh = useCallback(() => {
        refreshAll();
        toast.success('Data refreshed', {
            description: 'All client calculations have been updated.',
        });
    }, [refreshAll]);

    return (
        <>
            <Header
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAddClick={handleAddClick}
                onExportClick={handleExport}
                onRefreshClick={handleRefresh}
                isDark={isDark}
                onThemeToggle={toggleTheme}
                expiringCount={stats.expiringSoon}
            />

            <main className="container mx-auto px-4 pb-8">
                <DashboardStats
                    stats={stats}
                    activeFilter={statusFilter}
                    onFilterChange={handleStatusFilterChange}
                />
                <ClientSection
                    clients={filteredClients}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    activeFilter={statusFilter}
                    onClearFilter={() => handleStatusFilterChange('all')}
                />
            </main>

            <ClientDialog
                isOpen={isClientDialogOpen}
                onClose={() => setIsClientDialogOpen(false)}
                onSubmit={handleClientSubmit}
                client={selectedClient}
                mode={dialogMode}
            />

            <DeleteDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDeleteConfirm}
                client={selectedClient}
            />
        </>
    );
}
