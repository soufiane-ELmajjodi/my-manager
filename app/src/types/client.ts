/**
 * GPS Subscription Client Type Definitions
 */

export type SubscriptionStatus = 'active' | 'expiring-soon' | 'expired';

export interface Client {
  id: string;
  clientName: string;
  imei: string;
  gpsNumber: string;
  installationDate: string; // ISO date string YYYY-MM-DD
  durationMonths: number;
  expirationDate: string; // Auto-calculated: installationDate + durationMonths
  remainingDays: number; // Auto-calculated: expirationDate - today
  status: SubscriptionStatus; // Auto-calculated based on remainingDays
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientFormData {
  clientName: string;
  imei: string;
  gpsNumber: string;
  installationDate: string;
  durationMonths: number;
  phoneNumber: string;
}

export interface DashboardStats {
  totalClients: number;
  activeSubscriptions: number;
  expiringSoon: number; // ≤30 days
  expired: number;
}

export interface SortConfig {
  key: keyof Client | null;
  direction: 'asc' | 'desc';
}
