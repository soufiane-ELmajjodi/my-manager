import type { Client } from '@/types/client';
import { addMonths, differenceInDays, format } from 'date-fns';

/**
 * Generate a client with auto-calculated fields
 */
function generateClient(
  id: string,
  clientName: string,
  imei: string,
  gpsNumber: string,
  installationDate: string,
  durationMonths: number,
  phoneNumber: string
): Client {
  const today = new Date();
  const installDate = new Date(installationDate);
  const expirationDate = addMonths(installDate, durationMonths);
  const remainingDays = differenceInDays(expirationDate, today);
  
  let status: Client['status'] = 'active';
  if (remainingDays < 0) {
    status = 'expired';
  } else if (remainingDays <= 30) {
    status = 'expiring-soon';
  }

  return {
    id,
    clientName,
    imei,
    gpsNumber,
    installationDate,
    durationMonths,
    expirationDate: format(expirationDate, 'yyyy-MM-dd'),
    remainingDays,
    status,
    phoneNumber,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Initial mock data for GPS subscription clients
 */
export const mockClients: Client[] = [
  // Active clients (more than 30 days remaining)
  generateClient('1', 'Ahmed Hassan', '354601080768901', 'GPS-2024-001', '2024-01-15', 12, '+20 100 123 4567'),
  generateClient('2', 'Mohamed Ali', '354601080768902', 'GPS-2024-002', '2024-03-20', 12, '+20 101 234 5678'),
  generateClient('3', 'Sara Mahmoud', '354601080768903', 'GPS-2024-003', '2024-06-10', 6, '+20 102 345 6789'),
  generateClient('4', 'Fatima Omar', '354601080768904', 'GPS-2024-004', '2024-08-05', 12, '+20 103 456 7890'),
  generateClient('5', 'Khaled Ibrahim', '354601080768905', 'GPS-2024-005', '2024-09-01', 12, '+20 104 567 8901'),
  
  // Expiring soon (≤30 days)
  generateClient('6', 'Nour El-Din', '354601080768906', 'GPS-2024-006', '2024-02-10', 12, '+20 105 678 9012'),
  generateClient('7', 'Laila Ahmed', '354601080768907', 'GPS-2024-007', '2024-02-15', 12, '+20 106 789 0123'),
  generateClient('8', 'Omar Farouk', '354601080768908', 'GPS-2024-008', '2024-07-20', 6, '+20 107 890 1234'),
  
  // Expired clients
  generateClient('9', 'Hana Saleh', '354601080768909', 'GPS-2023-009', '2023-01-10', 12, '+20 108 901 2345'),
  generateClient('10', 'Youssef Kamal', '354601080768910', 'GPS-2023-010', '2023-03-15', 6, '+20 109 012 3456'),
  generateClient('11', 'Rania Fathi', '354601080768911', 'GPS-2023-011', '2023-05-20', 12, '+20 110 123 4567'),
  generateClient('12', 'Tarek Mostafa', '354601080768912', 'GPS-2023-012', '2023-06-01', 6, '+20 111 234 5678'),
  
  // More active clients
  generateClient('13', 'Dina Samir', '354601080768913', 'GPS-2024-013', '2024-10-01', 12, '+20 112 345 6789'),
  generateClient('14', 'Amr Diab', '354601080768914', 'GPS-2024-014', '2024-11-15', 6, '+20 113 456 7890'),
  generateClient('15', 'Mona Zaki', '354601080768915', 'GPS-2024-015', '2024-12-01', 12, '+20 114 567 8901'),
];

/**
 * Get updated client data with fresh calculations
 */
export function refreshClientCalculations(client: Client): Client {
  const today = new Date();
  const installDate = new Date(client.installationDate);
  const expirationDate = addMonths(installDate, client.durationMonths);
  const remainingDays = differenceInDays(expirationDate, today);
  
  let status: Client['status'] = 'active';
  if (remainingDays < 0) {
    status = 'expired';
  } else if (remainingDays <= 30) {
    status = 'expiring-soon';
  }

  return {
    ...client,
    expirationDate: format(expirationDate, 'yyyy-MM-dd'),
    remainingDays,
    status,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Refresh all clients with updated calculations
 */
export function refreshAllClients(clients: Client[]): Client[] {
  return clients.map(refreshClientCalculations);
}
