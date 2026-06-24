const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

const googleSheetsDB = require('./googleSheets');

// Initialize Google Sheets connection
googleSheetsDB.initialize().catch(err => {
    console.error('Failed to initialize Google Sheets:', err.message);
    process.exit(1);
});

// Routes
const authRoutes = require("./routes/auth");
const clientsRoutes = require("./routes/clients");

app.use("/api/auth", authRoutes);
app.use("/api/clients", clientsRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        database: 'Google Sheets',
        initialized: googleSheetsDB.initialized
    });
});

module.exports = app;

// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });
