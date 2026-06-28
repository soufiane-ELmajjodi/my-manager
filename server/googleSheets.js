const { google } = require('googleapis');
const path = require('path');
require('dotenv').config();

class GoogleSheetsDB {
    constructor() {
        this.sheets = null;
        this.spreadsheetId = process.env.GOOGLE_SHEET_ID;
        this.sheetName = process.env.GOOGLE_SHEET_NAME || 'Clients';
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;
        try {
            // Load credentials: base64 > individual env vars > JSON > file
            let credentials;
            if (process.env.GOOGLE_CREDENTIALS_BASE64) {
                try {
                    const decoded = Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf-8');
                    credentials = JSON.parse(decoded);
                } catch (e) {
                    throw new Error('GOOGLE_CREDENTIALS_BASE64 is not valid base64 JSON');
                }
            } else if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
                const normalizeNewlines = (str) => (str || '').replace(/\\n/g, '\n');
                credentials = {
                    type: process.env.GOOGLE_TYPE || 'service_account',
                    project_id: process.env.GOOGLE_PROJECT_ID,
                    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
                    private_key: normalizeNewlines(process.env.GOOGLE_PRIVATE_KEY),
                    client_email: process.env.GOOGLE_CLIENT_EMAIL,
                    client_id: process.env.GOOGLE_CLIENT_ID,
                    auth_uri: process.env.GOOGLE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
                    token_uri: process.env.GOOGLE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
                };
            } else if (process.env.GOOGLE_CREDENTIALS_JSON) {
                try {
                    credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
                } catch (e) {
                    throw new Error('GOOGLE_CREDENTIALS_JSON is not valid JSON');
                }
            } else {
                const credentialsPath = process.env.GOOGLE_CREDENTIALS_PATH || path.join(__dirname, 'credentials.json');
                try {
                    credentials = require(credentialsPath);
                } catch (e) {
                    throw new Error(
                        'No Google credentials found. Set GOOGLE_CREDENTIALS_BASE64 env var ' +
                        '(on Vercel) or place credentials.json in the server/ directory (local).'
                    );
                }
            }

            // Create auth client
            const auth = new google.auth.GoogleAuth({
                credentials,
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });

            const authClient = await auth.getClient();
            this.sheets = google.sheets({ version: 'v4', auth: authClient });

            // Verify connection and initialize headers if needed
            await this.initializeHeaders();

            this.initialized = true;
            console.log('Google Sheets connected ✅');
            console.log(`Sheet ID: ${this.spreadsheetId}`);
            console.log(`Sheet Name: ${this.sheetName}`);
        } catch (error) {
            console.error('Google Sheets initialization error:', error.message);

            // If it's a range error, try to list available sheets to help the user
            if (error.message.includes('Unable to parse range')) {
                try {
                    const spreadsheet = await this.sheets.spreadsheets.get({
                        spreadsheetId: this.spreadsheetId,
                    });
                    const sheetNames = spreadsheet.data.sheets.map(s => s.properties.title);
                    console.log('Available sheets in this spreadsheet:', sheetNames.join(', '));
                    console.log(`Check if your GOOGLE_SHEET_NAME in .env matches one of these!`);
                } catch (innerError) {
                    // Ignore errors during error reporting
                }
            }
            throw error;
        }
    }

    async ensureInitialized() {
        if (!this.initialized) {
            await this.initialize();
        }
    }

    // Helper: Get properly formatted sheet range
    getSheetRange(cellRange) {
        // If sheet name contains spaces, wrap it in single quotes
        const sheetName = this.sheetName.includes(' ')
            ? `'${this.sheetName}'`
            : this.sheetName;
        return `${sheetName}!${cellRange}`;
    }

    async initializeHeaders() {
        try {
            // Check if headers exist
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: this.getSheetRange('A1:K1'),
            });

            const headers = response.data.values?.[0];

            // If no headers, create them
            if (!headers || headers.length === 0) {
                const headerRow = [
                    'id',
                    'clientName',
                    'imei',
                    'gpsNumber',
                    'installationDate',
                    'duration',
                    'expirationDate',
                    'remainingDays',
                    'status',
                    'phone',
                    'created_at'
                ];

                await this.sheets.spreadsheets.values.update({
                    spreadsheetId: this.spreadsheetId,
                    range: this.getSheetRange('A1:K1'),
                    valueInputOption: 'RAW',
                    resource: {
                        values: [headerRow],
                    },
                });

                console.log('Headers initialized in Google Sheet 📋');
            }
        } catch (error) {
            console.error('Error initializing headers:', error.message);
            throw error;
        }
    }

    async getAllClients() {
        try {
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: this.getSheetRange('A2:K'),
            });

            const rows = response.data.values || [];
            return rows.map((row, index) => this.rowToClient(row, index + 2));
        } catch (error) {
            console.error('Error getting all clients:', error.message);
            throw error;
        }
    }

    async getClientById(id) {
        try {
            const clients = await this.getAllClients();
            return clients.find(client => client.id === parseInt(id));
        } catch (error) {
            console.error('Error getting client by ID:', error.message);
            throw error;
        }
    }

    async createClient(clientData) {
        try {
            // Get next ID
            const clients = await this.getAllClients();
            const nextId = clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1;

            const newClient = {
                id: nextId,
                clientName: clientData.clientName || '',
                imei: clientData.imei || '',
                gpsNumber: clientData.gpsNumber || '',
                installationDate: clientData.installationDate || '',
                duration: clientData.duration || '',
                expirationDate: clientData.expirationDate || '',
                remainingDays: clientData.remainingDays || 0,
                status: clientData.status || '',
                phone: clientData.phone || '',
                created_at: new Date().toISOString(),
            };

            const row = this.clientToRow(newClient);

            await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: this.getSheetRange('A:K'),
                valueInputOption: 'RAW',
                resource: {
                    values: [row],
                },
            });

            return { id: nextId, ...newClient };
        } catch (error) {
            console.error('Error creating client:', error.message);
            throw error;
        }
    }

    async updateClient(id, clientData) {
        try {
            const clients = await this.getAllClients();
            const clientIndex = clients.findIndex(c => c.id === parseInt(id));

            if (clientIndex === -1) {
                throw new Error('Client not found');
            }

            const rowNumber = clientIndex + 2; // +2 because of header row and 0-indexing

            const updatedClient = {
                id: parseInt(id),
                clientName: clientData.clientName || '',
                imei: clientData.imei || '',
                gpsNumber: clientData.gpsNumber || '',
                installationDate: clientData.installationDate || '',
                duration: clientData.duration || '',
                expirationDate: clientData.expirationDate || '',
                remainingDays: clientData.remainingDays || 0,
                status: clientData.status || '',
                phone: clientData.phone || '',
                created_at: clients[clientIndex].created_at, // Keep original timestamp
            };

            const row = this.clientToRow(updatedClient);

            await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range: this.getSheetRange(`A${rowNumber}:K${rowNumber}`),
                valueInputOption: 'RAW',
                resource: {
                    values: [row],
                },
            });

            return updatedClient;
        } catch (error) {
            console.error('Error updating client:', error.message);
            throw error;
        }
    }

    async deleteClient(id) {
        try {
            const clients = await this.getAllClients();
            const clientIndex = clients.findIndex(c => c.id === parseInt(id));

            if (clientIndex === -1) {
                throw new Error('Client not found');
            }

            const rowNumber = clientIndex + 2; // +2 because of header row and 0-indexing

            await this.sheets.spreadsheets.batchUpdate({
                spreadsheetId: this.spreadsheetId,
                resource: {
                    requests: [
                        {
                            deleteDimension: {
                                range: {
                                    sheetId: 0, // First sheet
                                    dimension: 'ROWS',
                                    startIndex: rowNumber - 1, // 0-indexed
                                    endIndex: rowNumber,
                                },
                            },
                        },
                    ],
                },
            });

            return true;
        } catch (error) {
            console.error('Error deleting client:', error.message);
            throw error;
        }
    }

    // Helper: Convert row array to client object
    rowToClient(row, rowNumber) {
        return {
            id: parseInt(row[0]) || rowNumber - 1,
            clientName: row[1] || '',
            imei: row[2] || '',
            gpsNumber: row[3] || '',
            installationDate: row[4] || '',
            duration: row[5] || '',
            expirationDate: row[6] || '',
            remainingDays: parseInt(row[7]) || 0,
            status: row[8] || '',
            phone: row[9] || '',
            created_at: row[10] || '',
        };
    }

    // Helper: Convert client object to row array
    clientToRow(client) {
        return [
            client.id,
            client.clientName,
            client.imei,
            client.gpsNumber,
            client.installationDate,
            client.duration,
            client.expirationDate,
            client.remainingDays,
            client.status,
            client.phone,
            client.created_at,
        ];
    }
}

// Create singleton instance
const googleSheetsDB = new GoogleSheetsDB();

module.exports = googleSheetsDB;
