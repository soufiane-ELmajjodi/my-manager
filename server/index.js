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
        const email = process.env.GOOGLE_CLIENT_EMAIL || process.env.GOOGLE_CREDENTIALS_JSON
            ? 'from JSON' : process.env.GOOGLE_CREDENTIALS_BASE64 ? 'from base64' : 'from file';
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
