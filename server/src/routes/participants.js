const express = require('express');
const router = express.Router();
const { Participant, Bolso } = require('../models');

// PUT /api/participants/:id
router.put('/:id', async (req, res) => {
    try {
        const { name, turn } = req.body;
        const participant = await Participant.findByPk(req.params.id);

        if (!participant) return res.status(404).json({ error: 'Participant not found' });

        // Validate turn uniqueness if turn is modified
        if (turn !== undefined && turn !== null && turn !== participant.turn) {
            const existing = await Participant.findOne({
                where: {
                    bolsoId: participant.bolsoId,
                    turn: turn
                }
            });
            if (existing) {
                return res.status(400).json({ error: `El turno #${turn} ya está asignado.` });
            }
        }

        if (name) participant.name = name;
        if (turn !== undefined) participant.turn = turn;

        await participant.save();
        res.json(participant);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
