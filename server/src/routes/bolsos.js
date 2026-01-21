const express = require('express');
const router = express.Router();
const { Bolso, Participant, Payment } = require('../models');

// GET /api/bolsos - List all bolsos
router.get('/', async (req, res) => {
    try {
        const bolsos = await Bolso.findAll({
            order: [['createdAt', 'DESC']],
            include: [
                { model: Participant },
                { model: Payment }
            ]
        });
        res.json(bolsos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// GET /api/bolsos/:id - Get specific bolso details
router.get('/:id', async (req, res) => {
    try {
        const bolso = await Bolso.findOne({
            where: { id: req.params.id },
            include: [
                {
                    model: Participant,
                    // Order participants by turn, nulls last usually happens by default or needs literal
                    // For now just generic sort
                },
                { model: Payment }
            ]
        });

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
router.post('/', async (req, res) => {
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

        const schedule = calculateSchedule(startDate, frequency, duration);

        const newBolso = await Bolso.create({
            name,
            frequency,
            startDate,
            duration,
            amount,
            schedule,
            archived: false
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

// DELETE /api/bolsos/:id
router.delete('/:id', async (req, res) => {
    try {
        const result = await Bolso.destroy({ where: { id: req.params.id } });
        if (result === 0) return res.status(404).json({ error: 'Bolso not found' });
        res.json({ message: 'Bolso deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
