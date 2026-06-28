const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

const googleSheetsDB = require('./googleSheets');

// Routes
const authRoutes = require("./routes/auth");
const clientsRoutes = require("./routes/clients");

app.use("/api/auth", authRoutes);
app.use("/api/clients", clientsRoutes);

// Debug: test auth independently
const { google } = require('googleapis');
const path = require('path');

app.get('/api/debug/auth', async (req, res) => {
    const jwt = require('jsonwebtoken');
    try {
        const credsPath = process.env.GOOGLE_CREDENTIALS_PATH || path.join(__dirname, 'credentials.json');
        let credentials;
        try {
            credentials = require(credsPath);
        } catch (e) {
            return res.json({ status: 'error', step: 'load', dirname: __dirname, credsPath, error: e.message });
        }

        // Test 1: google-auth-library approach
        try {
            const auth = new google.auth.GoogleAuth({
                credentials,
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });
            const client = await auth.getClient();
            const token = await client.getAccessToken();
            return res.json({ status: 'ok', method: 'google-auth-library', has_token: !!token.token });
        } catch (libErr) {
            // Test 2: manual JWT approach using jsonwebtoken
            try {
                const now = Math.floor(Date.now() / 1000);
                const assertion = jwt.sign(
                    { iss: credentials.client_email, scope: 'https://www.googleapis.com/auth/spreadsheets', aud: credentials.token_uri || 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 },
                    credentials.private_key,
                    { algorithm: 'RS256' }
                );

                // Show decoded JWT header and payload for debugging
                const parts = assertion.split('.');
                const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
                const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());

                const resp = await fetch(credentials.token_uri || 'https://oauth2.googleapis.com/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
                });
                const data = await resp.json();

                if (data.access_token) {
                    return res.json({ status: 'ok', method: 'manual-jwt' });
                } else {
                    return res.json({
                        status: 'error', step: 'manual-jwt',
                        error: data.error_description || data.error,
                        jwt_header: header,
                        jwt_payload: { iss: payload.iss, aud: payload.aud, scope: payload.scope },
                        node_version: process.version
                    });
                }
            } catch (manualErr) {
                return res.json({ status: 'error', step: 'manual-jwt-exception', error: manualErr.message, lib_error: libErr.message });
            }
        }
    } catch (err) {
        res.json({ status: 'error', step: 'unknown', error: err.message });
    }
});

// Health check route
app.get('/api/health', async (req, res) => {
    try {
        await googleSheetsDB.ensureInitialized();
        res.json({
            status: 'ok',
            database: 'Google Sheets',
            initialized: googleSheetsDB.initialized,
            sheet_id: googleSheetsDB.spreadsheetId
        });
    } catch (err) {
        res.status(503).json({
            status: 'error',
            database: 'Google Sheets',
            initialized: false,
            error: err.message,
            credentials_method: process.env.GOOGLE_CREDENTIALS_BASE64
                ? 'base64' : process.env.GOOGLE_CLIENT_EMAIL
                ? 'individual' : process.env.GOOGLE_CREDENTIALS_JSON
                ? 'json' : 'file'
        });
    }
});

module.exports = app;

// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });
