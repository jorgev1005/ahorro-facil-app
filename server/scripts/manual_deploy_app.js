const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';
const LOCAL_SERVER_DIR = path.join(__dirname, '..');

const conn = new Client();

console.log('🚀 Connecting to VPS for MANUAL UPLOAD (APP.JS FIX)...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // Read local file
    let appJs = fs.readFileSync(path.join(LOCAL_SERVER_DIR, 'src/app.js'), 'utf8');

    // FIX: Remove duplicate definition if present locally, or just ensure correct content
    // Based on previous cat, it had:
    // const paymentRoutes = require('./routes/payments');
    // const paymentRoutes = require('./routes/payments');

    // Simplest fix: use regex to remove duplicate line
    // Or just write the KNOWN GOOD content.

    const goodAppJs = `
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware (CORS configured for production)
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Basic Route for testing
app.get('/', (req, res) => {
    res.send('Ahorro Fácil API is running');
});

// Routes
const bolsoRoutes = require('./routes/bolsos');
const participantRoutes = require('./routes/participants');
const paymentRoutes = require('./routes/payments');
const authRoutes = require('./routes/auth');
const publicRoutes = require('./routes/public');

app.use('/api/bolsos', bolsoRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);

module.exports = app;
`;

    const appBase64 = Buffer.from(goodAppJs).toString('base64');

    const cmd = `
    cd ${REMOTE_DIR}
    echo "--- UPLOADING app.js ---"
    echo "${appBase64}" | base64 -d > src/app.js
    
    pm2 restart all
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ UPLOAD & RESTART DONE');
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
