import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Client, ClientFormData, DashboardStats, SortConfig, SubscriptionStatus } from '@/types/client';
import { addMonths, differenceInDays, format } from 'date-fns';

// Use relative path for proxy support
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Custom hook for managing client data and operations
 */
export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | 'all'>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetch all clients from the backend
   */
  const fetchClients = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/clients`);
      if (!response.ok) throw new Error('Failed to fetch clients');
      const data = await response.json();

      // Transform backend data to match frontend Client type
      const transformedClients: Client[] = data.map((item: any) => ({
        id: item.id.toString(),
        clientName: item.clientName || '',
        imei: item.imei || '',
        gpsNumber: item.gpsNumber || '',
        installationDate: item.installationDate || '',
        durationMonths: parseInt(item.duration) || 0,
        expirationDate: item.expirationDate || '',
        remainingDays: parseInt(item.remainingDays) || 0,
        status: item.status as SubscriptionStatus || 'active',
        phoneNumber: item.phone || '',
        createdAt: item.created_at || new Date().toISOString(),
        updatedAt: item.created_at || new Date().toISOString(),
      }));

      setClients(transformedClients);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load clients on mount
   */
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  /**
   * Calculate dashboard statistics
   */
  const stats: DashboardStats = useMemo(() => {
    return {
      totalClients: clients.length,
      activeSubscriptions: clients.filter(c => c.status === 'active').length,
      expiringSoon: clients.filter(c => c.status === 'expiring-soon').length,
      expired: clients.filter(c => c.status === 'expired').length,
    };
  }, [clients]);

  /**
   * Filter and sort clients based on search query, status filter, and sort configuration
   */
  const filteredClients = useMemo(() => {
    let result = [...clients];

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(client => client.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        client =>
          client.clientName.toLowerCase().includes(query) ||
          client.imei.toLowerCase().includes(query) ||
          client.gpsNumber.toLowerCase().includes(query) ||
          client.phoneNumber.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc'
            ? aValue - bValue
            : bValue - aValue;
        }

        return 0;
      });
    }

    return result;
  }, [clients, searchQuery, statusFilter, sortConfig]);

  /**
   * Generate a new client with auto-calculated fields
   */
  const createClient = useCallback(async (formData: ClientFormData): Promise<Client | null> => {
    try {
      const today = new Date();
      const installDate = new Date(formData.installationDate);
      const expirationDate = addMonths(installDate, formData.durationMonths);
      const remainingDays = differenceInDays(expirationDate, today);

      let status: Client['status'] = 'active';
      if (remainingDays < 0) {
        status = 'expired';
      } else if (remainingDays <= 30) {
        status = 'expiring-soon';
      }

      const payload = {
        clientName: formData.clientName,
        imei: formData.imei,
        gpsNumber: formData.gpsNumber,
        installationDate: formData.installationDate,
        duration: formData.durationMonths.toString(),
        expirationDate: format(expirationDate, 'yyyy-MM-dd'),
        remainingDays,
        status,
        phone: formData.phoneNumber,
      };

      const response = await fetch(`${API_BASE_URL}/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to create client');

      const result = await response.json();

      // Refresh clients list
      await fetchClients();

      return result.client;
    } catch (error) {
      console.error('Error creating client:', error);
      return null;
    }
  }, [fetchClients]);

  /**
   * Update an existing client
   */
  const updateClient = useCallback(async (id: string, formData: ClientFormData) => {
    try {
      const today = new Date();
      const installDate = new Date(formData.installationDate);
      const expirationDate = addMonths(installDate, formData.durationMonths);
      const remainingDays = differenceInDays(expirationDate, today);

      let status: Client['status'] = 'active';
      if (remainingDays < 0) {
        status = 'expired';
      } else if (remainingDays <= 30) {
        status = 'expiring-soon';
      }

      const payload = {
        clientName: formData.clientName,
        imei: formData.imei,
        gpsNumber: formData.gpsNumber,
        installationDate: formData.installationDate,
        duration: formData.durationMonths.toString(),
        expirationDate: format(expirationDate, 'yyyy-MM-dd'),
        remainingDays,
        status,
        phone: formData.phoneNumber,
      };

      const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to update client');

      // Refresh clients list
      await fetchClients();
    } catch (error) {
      console.error('Error updating client:', error);
    }
  }, [fetchClients]);

  /**
   * Delete a client by ID
   */
  const deleteClient = useCallback(async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete client');

      // Refresh clients list
      await fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  }, [fetchClients]);

  /**
   * Refresh all client calculations (remaining days, status)
   */
  const refreshAll = useCallback(() => {
    fetchClients();
  }, [fetchClients]);

  /**
   * Handle sort column click
   */
  const handleSort = useCallback((key: keyof Client) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  /**
   * Handle status filter change
   */
  const handleStatusFilterChange = useCallback((filter: SubscriptionStatus | 'all') => {
    setStatusFilter(filter);
  }, []);

  return {
    clients,
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
    isLoading,
  };
}
