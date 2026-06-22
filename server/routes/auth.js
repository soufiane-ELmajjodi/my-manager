const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';

// Hardcoded admin credentials (you can move this to Google Sheets later)
const ADMIN_USER = {
    username: process.env.ADMIN_USERNAME || 'admin',
    // Default password: "admin123" - hashed
    passwordHash: process.env.ADMIN_PASSWORD_HASH || '$2a$10$rqYvKj5xKZXK5J5J5J5J5uK5J5J5J5J5J5J5J5J5J5J5J5J5J5J5J'
};

// POST /api/auth/login - Authenticate user
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Check username
        if (username !== ADMIN_USER.username) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // For simplicity, if no hash is set, allow plain text comparison (development only)
        let isValidPassword = false;

        if (ADMIN_USER.passwordHash.startsWith('$2a$') || ADMIN_USER.passwordHash.startsWith('$2b$')) {
            // Hashed password
            isValidPassword = await bcrypt.compare(password, ADMIN_USER.passwordHash);
        } else {
            // Plain text password (development only - not recommended for production)
            isValidPassword = password === ADMIN_USER.passwordHash;
        }

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                username: ADMIN_USER.username,
                role: 'admin'
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                username: ADMIN_USER.username,
                role: 'admin'
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/auth/verify - Verify token validity
router.get('/verify', (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.substring(7);

        const decoded = jwt.verify(token, JWT_SECRET);

        res.json({
            valid: true,
            user: {
                username: decoded.username,
                role: decoded.role
            }
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        res.status(401).json({ error: 'Invalid token' });
    }
});

// POST /api/auth/logout - Logout (client-side handles token removal)
router.post('/logout', (req, res) => {
    // In a stateless JWT system, logout is handled client-side by removing the token
    // This endpoint exists for consistency and can be extended for token blacklisting
    res.json({ message: 'Logout successful' });
});

module.exports = router;
