const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🚀 PATCHING AUTH ROUTE...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // Correct Auth Route (Adding 'id')
    const scriptContent = `
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Generate JWT Helper
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

/* 
 * POST /api/auth/login
 * Auth user & get token
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });

        if (user && (await user.matchPassword(password))) {
            res.json({
                id: user.id,   // Frontend expects 'id'
                _id: user.id,  // Legacy support
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                avatar: user.avatar,
                token: generateToken(user.id)
            });
        } else {
            res.status(401).json({ error: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

/* 
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ where: { email } });

        if (userExists) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const user = await User.create({
            name, email, password
        });

        if (user) {
            res.status(201).json({
                id: user.id,
                _id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                token: generateToken(user.id)
            });
        } else {
            res.status(400).json({ error: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
`;

    const base64Content = Buffer.from(scriptContent).toString('base64');

    // Command to overwrite file and restart
    const cmd = `
    cd ${REMOTE_DIR}
    echo "${base64Content}" | base64 -d > src/routes/auth.js
    pm2 restart all
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ PATCH & RESTART DONE');
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
