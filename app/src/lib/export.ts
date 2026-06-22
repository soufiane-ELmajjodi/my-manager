import * as XLSX from 'xlsx';
import type { Client } from '@/types/client';

/**
 * Export clients data to Excel file
 */
export function exportToExcel(clients: Client[]): void {
  // Transform data for export
  const exportData = clients.map(client => ({
    'Client Name': client.clientName,
    'IMEI': client.imei,
    'GPS Number': client.gpsNumber,
    'Installation Date': new Date(client.installationDate).toLocaleDateString(),
    'Duration (Months)': client.durationMonths,
    'Expiration Date': new Date(client.expirationDate).toLocaleDateString(),
    'Remaining Days': client.remainingDays,
    'Status': client.status === 'active' ? 'Active' : 
              client.status === 'expiring-soon' ? 'Expiring Soon' : 'Expired',
    'Phone Number': client.phoneNumber,
  }));

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(exportData);

  // Set column widths
  const colWidths = [
    { wch: 20 }, // Client Name
    { wch: 18 }, // IMEI
    { wch: 15 }, // GPS Number
    { wch: 16 }, // Installation Date
    { wch: 16 }, // Duration
    { wch: 16 }, // Expiration Date
    { wch: 14 }, // Remaining Days
    { wch: 14 }, // Status
    { wch: 18 }, // Phone Number
  ];
  ws['!cols'] = colWidths;

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'GPS Clients');

  // Generate filename with current date
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `GPS_Clients_${dateStr}.xlsx`;

  // Save file
  XLSX.writeFile(wb, filename);
}

/**
 * Export clients data to CSV file
 */
export function exportToCSV(clients: Client[]): void {
  const exportData = clients.map(client => ({
    'Client Name': client.clientName,
    'IMEI': client.imei,
    'GPS Number': client.gpsNumber,
    'Installation Date': new Date(client.installationDate).toLocaleDateString(),
    'Duration (Months)': client.durationMonths,
    'Expiration Date': new Date(client.expirationDate).toLocaleDateString(),
    'Remaining Days': client.remainingDays,
    'Status': client.status === 'active' ? 'Active' : 
              client.status === 'expiring-soon' ? 'Expiring Soon' : 'Expired',
    'Phone Number': client.phoneNumber,
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const csv = XLSX.utils.sheet_to_csv(ws);

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  link.href = URL.createObjectURL(blob);
  link.download = `GPS_Clients_${dateStr}.csv`;
  link.click();
}
