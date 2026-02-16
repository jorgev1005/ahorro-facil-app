const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🚀 RESTORING CLEAN BOLSOS ROUTE...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // Original clean version
    const scriptContent = `
const express = require('express');
const router = express.Router();
const { Bolso, Participant, Payment } = require('../models');
const { protect } = require('../middleware/auth');

// GET /api/bolsos - List all bolsos
router.get('/', protect, async (req, res) => {
    try {
        const query = {
            order: [['createdAt', 'DESC']],
            include: [
                { model: Participant },
                { model: Payment }
            ]
        };

        // If not admin, restrict to own bolsos
        if (!req.user.isAdmin) {
            query.where = { userId: req.user.id };
        } else {
            // If Admin, include User info to know who owns it
            const { User } = require('../models');
            query.include.push({
                model: User,
                attributes: ['name', 'email']
            });
        }

        const bolsos = await Bolso.findAll(query);

        // Ensure participants are sorted by turn
        const sortedBolsos = bolsos.map(b => {
            const json = b.toJSON();
            if (json.Participants) {
                json.Participants.sort((a, b) => {
                    if (a.turn && b.turn) return a.turn - b.turn;
                    if (a.turn) return -1;
                    if (b.turn) return 1;
                    return 0;
                });
            }
            return json;
        });

        res.json(sortedBolsos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// GET /api/bolsos/:id - Get specific bolso details
router.get('/:id', protect, async (req, res) => {
    try {
        const query = {
            where: { id: req.params.id },
            include: [
                {
                    model: Participant,
                },
                { model: Payment }
            ]
        };

        if (!req.user.isAdmin) {
            query.where.userId = req.user.id;
        }

        const bolso = await Bolso.findOne(query);

        if (!bolso) return res.status(404).json({ error: 'Bolso not found' });

        // Custom sort for participants just to be safe (Turn 1, 2, 3... then nulls)
        if (bolso.Participants) {
            bolso.Participants.sort((a, b) => {
                if (a.turn && b.turn) return a.turn - b.turn;
                if (a.turn) return -1;
                if (b.turn) return 1;
                return 0; // Order of creation/insertion
            });
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
            let current = new Date(start + 'T12:00:00'); // Simple parse
            for (let i = 0; i < dur; i++) {
                dates.push(current.toISOString().split('T')[0]);
                if (freq === 'weekly') current.setDate(current.getDate() + 7);
                else if (freq === 'biweekly') current.setDate(current.getDate() + 14);
                else if (freq === 'monthly') current.setMonth(current.getMonth() + 1);
            }
            return dates;
        };

        const schedule = req.body.schedule && Array.isArray(req.body.schedule) && req.body.schedule.length > 0
            ? req.body.schedule
            : calculateSchedule(startDate, frequency, duration);

        const newBolso = await Bolso.create({
            name,
            frequency,
            startDate,
            duration,
            amount,
            schedule,
            archived: false,
            userId: req.user.id
        });

        // Create Participants
        const participantsData = Array.from({ length: participantsCount }, (_, i) => ({
            name: \`Participante \${i + 1}\`,
            bolsoId: newBolso.id
        }));

        await Participant.bulkCreate(participantsData);

        // Return complete object
        const createdBolso = await Bolso.findByPk(newBolso.id, {
            include: [{ model: Participant }]
        });

        res.status(201).json(createdBolso);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// PUT /api/bolsos/:id - Update generic fields (like archive)
router.put('/:id', protect, async (req, res) => {
    try {
        const { name, archived, frequency, startDate, duration, amount } = req.body;
        const query = { where: { id: req.params.id } };
        if (!req.user.isAdmin) {
            query.where.userId = req.user.id;
        }

        const bolso = await Bolso.findOne(query);

        if (!bolso) return res.status(404).json({ error: 'Bolso not found' });

        if (name !== undefined) bolso.name = name;
        if (archived !== undefined) bolso.archived = archived;
        
        await bolso.save();

        await bolso.reload(); // Ensure persistence
        res.json(bolso);
    } catch (error) {
        console.error('[PUT Bolso] Error:', error); // DEBUG
        res.status(500).json({ error: error.message || 'Server Error' });
    }
});

// DELETE /api/bolsos/admin/reset_demo_data
router.delete('/admin/reset_demo_data', protect, async (req, res) => {
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin only' });
    try {
        await Payment.destroy({ where: {} });
        await Participant.destroy({ where: {} });
        await Bolso.destroy({ where: {} });
        res.json({ message: 'App reset successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// DELETE /api/bolsos/:id
router.delete('/:id', protect, async (req, res) => {
    try {
        const query = { where: { id: req.params.id } };
        if (!req.user.isAdmin) {
            query.where.userId = req.user.id;
        }

        const result = await Bolso.destroy(query);
        if (result === 0) return res.status(404).json({ error: 'Bolso not found' });
        res.json({ message: 'Bolso deleted' });
    } catch (error) {
        console.error(error);
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
            console.log('✅ RESTORE & RESTART DONE');
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
