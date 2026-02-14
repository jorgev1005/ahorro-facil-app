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

const conn = new Client();

console.log('🚀 Connecting to VPS for DEBUG PING UPLOAD...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // 1. New PUBLIC.JS with PING
    const publicJsContent = `
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Bolso, Participant, Payment } = require('../models');

console.log('🔄 [Public] Module Logic Loaded');

// PING ROUTE
router.get('/ping', (req, res) => {
    console.log('🏓 [Public] Ping received');
    res.send('pong');
});

// GET /api/public/participant/:token
router.get('/participant/:token', async (req, res) => {
    try {
        const { token } = req.params;
        console.log('🔍 [Public] Request received for token:', token ? token.substring(0, 10) + '...' : 'null');

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('✅ [Public] Token Verified. Payload:', JSON.stringify(decoded));
        } catch (e) {
            console.error('❌ [Public] JWT Verify Error:', e.message);
            return res.status(401).json({ error: 'Enlace inválido o expirado' });
        }

        const { participantId } = decoded;
        console.log('🔍 [Public] Searching for Participant ID:', participantId);

        // Fetch Participant details
        const participant = await Participant.findOne({
            where: { id: participantId },
            include: [{
                model: Payment,
            }]
        });

        if (!participant) {
            console.warn('⚠️ [Public] Participant NOT FOUND in DB');
            return res.status(404).json({ error: 'Participante no encontrado' });
        }
        console.log('✅ [Public] Participant Found:', participant.name);

        // Fetch Bolso Summary (Limited info)
        const bolso = await Bolso.findByPk(participant.bolsoId, {
            attributes: ['id', 'name', 'amount', 'startDate', 'frequency', 'duration', 'schedule']
        });

        if (!bolso) {
            console.warn('⚠️ [Public] Bolso NOT FOUND:', participant.bolsoId);
            return res.status(404).json({ error: 'Bolso no encontrado' });
        }
        console.log('✅ [Public] Bolso Found:', bolso.name);

        res.json({
            participant,
            bolso
        });

    } catch (error) {
        console.error('🔥 [Public] Server Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
`;

    // 2. New APP.JS with Debug Logs
    const appJsContent = `
const express = require('express');
const cors = require('cors');
const app = express();

console.log('🔄 [App] Initializing...');

// Middleware
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Ahorro Fácil API is running');
});

// Routes
console.log('🔄 [App] Requiring Routes...');
const bolsoRoutes = require('./routes/bolsos');
const participantRoutes = require('./routes/participants');
const paymentRoutes = require('./routes/payments');
const authRoutes = require('./routes/auth');
const publicRoutes = require('./routes/public');

console.log('🔄 [App] Mounting Routes...');
app.use('/api/bolsos', bolsoRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
console.log('✅ [App] Routes Mounted.');

module.exports = app;
`;

    const publicBase64 = Buffer.from(publicJsContent).toString('base64');
    const appBase64 = Buffer.from(appJsContent).toString('base64');

    const cmd = `
    cd ${REMOTE_DIR}
    
    echo "--- UPLOADING public.js WITH PING ---"
    echo "${publicBase64}" | base64 -d > src/routes/public.js
    
    echo "--- UPLOADING app.js WITH LOGS ---"
    echo "${appBase64}" | base64 -d > src/app.js
    
    echo "--- RESTARTING ---"
    pm2 restart all
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ DEBUG UPLOAD DONE');
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
