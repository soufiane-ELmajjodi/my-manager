
const mysql = require("mysql2");
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "Manager_db",
    port: process.env.DB_PORT || 3003
});

db.connect(err => {
    if (err) {
        console.error("DB error:", err);
    } else {
        console.log("MySQL connected ✅");
        initDB();
    }
});

const initDB = () => {
    const createTable = `
      CREATE TABLE IF NOT EXISTS clients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        clientName VARCHAR(100),
        imei VARCHAR(50),
        gpsNumber VARCHAR(50),
        installationDate DATE,
        duration VARCHAR(50),
        expirationDate DATE,
        remainingDays INT,
        status VARCHAR(50),
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    db.query(createTable, (err, result) => {
        if (err) {
            console.error("Error creating table:", err);
        } else {
            console.log("Table 'clients' ready 📋");
        }
    });
};

module.exports = db;
