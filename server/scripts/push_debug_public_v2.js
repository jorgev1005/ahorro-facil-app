const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🚀 PUSHING DEBUG V2 PUBLIC ROUTE...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    const scriptContent = `
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Bolso, Participant, Payment } = require('../models');

// GET /api/public/ping
router.get('/ping', (req, res) => {
    res.json({ message: 'Public API is reachable', serverTime: new Date().toISOString() });
});

// GET /api/public/participant/:token
router.get('/participant/:token', async (req, res) => {
    try {
        const { token } = req.params;

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (e) {
            console.error('❌ JWT Verification Error:', e.message);
            return res.status(401).json({ 
                error: 'Enlace inválido o expirado', 
                debug: {
                    message: e.message,
                    tokenPart: token.substring(0, 10) + '...',
                    secretStart: process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 3) + '...' : 'UNDEFINED'
                }
            });
        }

        const { participantId } = decoded;

        const participant = await Participant.findOne({
            where: { id: participantId },
            include: [{ model: Payment }]
        });

        if (!participant) {
            return res.status(404).json({ error: 'Participante no encontrado' });
        }

        const bolso = await Bolso.findByPk(participant.bolsoId, {
            attributes: ['id', 'name', 'amount', 'startDate', 'frequency', 'duration', 'schedule']
        });

        if (!bolso) {
            return res.status(404).json({ error: 'Bolso no encontrado' });
        }

        res.json({ participant, bolso });

    } catch (error) {
        console.error('❌ SERVER ERROR:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
`;

    const base64Content = Buffer.from(scriptContent).toString('base64');

    const cmd = `
    cd ${REMOTE_DIR}
    echo "${base64Content}" | base64 -d > src/routes/public.js
    pm2 restart all
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ PUSH V2 DONE');
        }).on('data', (d) => console.log(d.toString()))
            .stderr.on('data', (d) => console.log('STDERR: ' + d));
    });
}).connect(config);
