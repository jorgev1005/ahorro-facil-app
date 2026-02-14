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

console.log('🚀 Connecting to VPS for VERBOSE LOGGING UPLOAD...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // Read local file
    let publicJs = fs.readFileSync(path.join(LOCAL_SERVER_DIR, 'src/routes/public.js'), 'utf8');

    // REPLACE ENTIRE CONTENT with verbose logging version
    // It's safer to reconstruct the file content here to ensure exact logic
    const newContent = `
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Bolso, Participant, Payment } = require('../models');

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

    const publicBase64 = Buffer.from(newContent).toString('base64');

    const cmd = `
    cd ${REMOTE_DIR}
    echo "--- UPLOADING public.js (VERBOSE) ---"
    echo "${publicBase64}" | base64 -d > src/routes/public.js
    
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
