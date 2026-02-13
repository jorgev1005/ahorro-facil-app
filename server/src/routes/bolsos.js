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

        // Calculate schedule dates
        // Re-implementing calculateSchedule logic here or trusting frontend to send it?
        // Better to have backend logic for truth.
        // For now, let's assume we implement a helper or just do the basic loop here.

        // Quick schedule calc:
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
            schedule,
            archived: false,
            userId: req.user.id
        });

        // Create Participants
        const participantsData = Array.from({ length: participantsCount }, (_, i) => ({
            name: `Participante ${i + 1}`,
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
        // Logic for updating other fields implies deeper changes (schedule recalc), 
        // for now restricting to simple props or full update if passed.

        console.log(`[PUT Bolso] Updating ${req.params.id} with`, req.body); // DEBUG
        await bolso.save();

        await bolso.reload(); // Ensure persistence
        res.json(bolso);
    } catch (error) {
        console.error('[PUT Bolso] Error:', error); // DEBUG
        res.status(500).json({ error: error.message || 'Server Error' });
    }
});

// DELETE /api/bolsos/admin/reset_demo_data - CAUTION: Deletes ALL data
router.delete('/admin/reset_demo_data', protect, async (req, res) => {
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin only' });
    console.log('RESET DEMO DATA REQUESTED'); // FORCE UPDATE
    try {
        // Transaction safety would be good, but simple cascade is enough for demo
        // Force delete all in correct order to respect Foreign Key constraints

        // 1. Delete all Payments (referencing Participants and Bolsos)
        await Payment.destroy({ where: {} });

        // 2. Delete all Participants (referencing Bolsos)
        await Participant.destroy({ where: {} });

        // 3. Delete all Bolsos
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
