const express = require("express");
const router = express.Router();
const googleSheetsDB = require("../googleSheets");

// GET all clients
router.get("/", async (req, res) => {
    try {
        const clients = await googleSheetsDB.getAllClients();
        res.json(clients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single client by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const client = await googleSheetsDB.getClientById(id);

        if (!client) {
            return res.status(404).json({ message: "Client not found" });
        }

        res.json(client);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create new client
router.post("/", async (req, res) => {
    try {
        const { clientName, imei, gpsNumber, installationDate, duration, expirationDate, remainingDays, status, phone } = req.body;

        const newClient = await googleSheetsDB.createClient({
            clientName,
            imei,
            gpsNumber,
            installationDate,
            duration,
            expirationDate,
            remainingDays,
            status,
            phone
        });

        res.json({ message: "Client added ✅", id: newClient.id, client: newClient });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update client
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { clientName, imei, gpsNumber, installationDate, duration, expirationDate, remainingDays, status, phone } = req.body;

        const updatedClient = await googleSheetsDB.updateClient(id, {
            clientName,
            imei,
            gpsNumber,
            installationDate,
            duration,
            expirationDate,
            remainingDays,
            status,
            phone
        });

        res.json({ message: "Client updated ✅", client: updatedClient });
    } catch (err) {
        if (err.message === 'Client not found') {
            return res.status(404).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
});

// DELETE client
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await googleSheetsDB.deleteClient(id);
        res.json({ message: "Client deleted ✅" });
    } catch (err) {
        if (err.message === 'Client not found') {
            return res.status(404).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
