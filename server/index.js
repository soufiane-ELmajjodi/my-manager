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
    const crypto = require('crypto');
    try {
        const credsPath = process.env.GOOGLE_CREDENTIALS_PATH || path.join(__dirname, 'credentials.json');
        let credentials;
        try {
            credentials = require(credsPath);
        } catch (e) {
            return res.json({ status: 'error', step: 'load', error: e.message });
        }

        // Test: sign JWT using raw crypto (no libraries)
        try {
            const keyObject = crypto.createPrivateKey(credentials.private_key);

            const now = Math.floor(Date.now() / 1000);
            const header = { alg: 'RS256', typ: 'JWT', kid: credentials.private_key_id };
            const payload = { iss: credentials.client_email, scope: 'https://www.googleapis.com/auth/spreadsheets', aud: credentials.token_uri || 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 };

            const encHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
            const encPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
            const signingInput = `${encHeader}.${encPayload}`;

            const pubKey = crypto.createPublicKey(keyObject);
            const pubDer = pubKey.export({ type: 'spki', format: 'der' });
            const pubFingerprint = crypto.createHash('sha256').update(pubDer).digest('hex');

            const signature = crypto.sign('RSA-SHA256', Buffer.from(signingInput), keyObject);
            const assertion = `${signingInput}.${signature.toString('base64url')}`;

            const resp = await fetch(credentials.token_uri || 'https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
            });
            const data = await resp.json();

            if (data.access_token) {
                return res.json({ status: 'ok', method: 'raw-crypto' });
            }
            // Hash comparison: check local vs Vercel digest
            const localSig = crypto.sign('RSA-SHA256', Buffer.from(signingInput), keyObject);
            return res.json({
                status: 'error', error: data.error_description || data.error,
                node_version: process.version,
                pub_fingerprint: pubFingerprint.substring(0, 16),
                expected_key_id: credentials.private_key_id
            });
        } catch (e) {
            return res.json({ status: 'error', step: 'sign', error: e.message });
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
