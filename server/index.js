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
    try {
        const credsPath = process.env.GOOGLE_CREDENTIALS_PATH || path.join(__dirname, 'credentials.json');
        let credentials;
        try {
            credentials = require(credsPath);
        } catch (e) {
            return res.json({ status: 'error', step: 'load', dirname: __dirname, credsPath, error: e.message });
        }

        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        let client;
        try {
            client = await auth.getClient();
        } catch (e) {
            return res.json({ status: 'error', step: 'getClient', error: e.message });
        }

        try {
            const token = await client.getAccessToken();
            return res.json({ status: 'ok', has_token: !!token.token });
        } catch (e) {
            return res.json({ status: 'error', step: 'getAccessToken', error: e.message });
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
