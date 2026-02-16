const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🚀 INJECTING DEBUG V2 (SIMPLE COUNT)...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // Debug V2 version of server/src/routes/bolsos.js
    const scriptContent = `
const express = require('express');
const router = express.Router();
const { Bolso, Participant, Payment } = require('../models');
const { protect } = require('../middleware/auth');

// GET /api/bolsos - List all bolsos
router.get('/', protect, async (req, res) => {
    console.log('--- DEBUG V2 GET /api/bolsos ---');
    console.log('User:', req.user.id);

    try {
        // TEST 1: Simple Count
        const simpleCount = await Bolso.count({ where: { userId: req.user.id } });
        console.log('📊 TEST 1 - Simple Count (No Includes):', simpleCount);

        // TEST 2: Simple FindAll
        const simpleFind = await Bolso.findAll({ where: { userId: req.user.id } });
        console.log('📂 TEST 2 - Simple FindAll (No Includes):', simpleFind.map(b => b.id));

        // TEST 3: Full Query
        const query = {
            order: [['createdAt', 'DESC']],
            include: [
                { model: Participant },
                { model: Payment }
            ]
        };

        if (!req.user.isAdmin) {
            query.where = { userId: req.user.id };
        } else {
             const { User } = require('../models');
             query.include.push({ model: User, attributes: ['name'] });
        }

        const bolsos = await Bolso.findAll(query);
        console.log(\`📦 TEST 3 - Full Query Result: \${bolsos.length} bolsos.\`);

        // Sort logic
        const sortedBolsos = bolsos.map(b => {
             const json = b.toJSON();
             if (json.Participants) {
                 json.Participants.sort((a,b) => (a.turn || 999) - (b.turn || 999));
             }
             return json;
        });

        res.json(sortedBolsos);
    } catch (error) {
        console.error('ERROR in GET /bolsos:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// GET /api/bolsos/:id - Get specific bolso details
router.get('/:id', protect, async (req, res) => {
    try {
        const query = {
            where: { id: req.params.id },
            include: [
                { model: Participant },
                { model: Payment }
            ]
        };

        if (!req.user.isAdmin) {
            query.where.userId = req.user.id;
        }

        const bolso = await Bolso.findOne(query);

        if (!bolso) return res.status(404).json({ error: 'Bolso not found' });

        if (bolso.Participants) {
             bolso.Participants.sort((a,b) => (a.turn || 999) - (b.turn || 999));
        }

        res.json(bolso);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});


// POST /api/bolsos - Create new bolso
router.post('/', protect, async (req, res) => {
    try {
        const { name, frequency, startDate, duration, amount, participantsCount } = req.body;
        const calculateSchedule = (start, freq, dur) => {
             const dates = [];
             let current = new Date(start + 'T12:00:00');
             for (let i = 0; i < dur; i++) {
                 dates.push(current.toISOString().split('T')[0]);
                 if (freq === 'weekly') current.setDate(current.getDate() + 7);
                 else if (freq === 'biweekly') current.setDate(current.getDate() + 14);
                 else if (freq === 'monthly') current.setMonth(current.getMonth() + 1);
             }
             return dates;
        };
        const schedule = req.body.schedule || calculateSchedule(startDate, frequency, duration);

        const newBolso = await Bolso.create({
            name, frequency, startDate, duration, amount, schedule,
            archived: false, userId: req.user.id
        });

        const participantsData = Array.from({ length: participantsCount }, (_, i) => ({
            name: \`Participante \${i + 1}\`, bolsoId: newBolso.id
        }));

        await Participant.bulkCreate(participantsData);
        const createdBolso = await Bolso.findByPk(newBolso.id, { include: [{ model: Participant }] });
        res.status(201).json(createdBolso);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

router.put('/:id', protect, async (req, res) => {
    try {
        const { name, archived } = req.body;
        const query = { where: { id: req.params.id } };
        if (!req.user.isAdmin) query.where.userId = req.user.id;
        const bolso = await Bolso.findOne(query);
        if (!bolso) return res.status(404).json({ error: 'Bolso not found' });
        if (name !== undefined) bolso.name = name;
        if (archived !== undefined) bolso.archived = archived;
        await bolso.save();
        await bolso.reload();
        res.json(bolso);
    } catch (error) {
         res.status(500).json({ error: 'Server Error' });
    }
});

router.delete('/:id', protect, async (req, res) => {
    try {
        const query = { where: { id: req.params.id } };
        if (!req.user.isAdmin) query.where.userId = req.user.id;
        const result = await Bolso.destroy(query);
        if (result === 0) return res.status(404).json({ error: 'Bolso not found' });
        res.json({ message: 'Bolso deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
`;

    const base64Content = Buffer.from(scriptContent).toString('base64');

    // Command to overwrite file and restart
    const cmd = `
    cd ${REMOTE_DIR}
    echo "${base64Content}" | base64 -d > src/routes/bolsos.js
    pm2 restart all
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ INJECTION V2 & RESTART DONE');
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
