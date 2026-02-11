const express = require('express');
const router = express.Router();
const { Participant, Bolso } = require('../models');
const { protect } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// GET /api/participants/:id/share_token
router.get('/:id/share_token', protect, async (req, res) => {
    try {
        const participant = await Participant.findOne({
            where: { id: req.params.id },
            include: [{ model: Bolso }]
        });

        if (!participant) return res.status(404).json({ error: 'Participant not found' });

        // Security check: only owner of bolso (or admin) can generate link
        if (!req.user.isAdmin && participant.Bolso.userId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Generate a long-lived JWT (e.g., 30 days) specifically for public access
        const token = jwt.sign(
            { participantId: participant.id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// PUT /api/participants/:id
router.put('/:id', async (req, res) => {
    try {
        const { name, turn, payoutDate, payoutAmount, payoutReference, payoutCurrency, payoutExchangeRate, payoutAmountBs } = req.body;
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
        if (payoutDate !== undefined) participant.payoutDate = payoutDate;
        if (payoutAmount !== undefined) participant.payoutAmount = payoutAmount;
        if (payoutReference !== undefined) participant.payoutReference = payoutReference;
        if (payoutCurrency !== undefined) participant.payoutCurrency = payoutCurrency;
        if (payoutExchangeRate !== undefined) participant.payoutExchangeRate = payoutExchangeRate;
        if (payoutAmountBs !== undefined) participant.payoutAmountBs = payoutAmountBs;

        if (payoutAmountBs !== undefined) participant.payoutAmountBs = payoutAmountBs;

        console.log('Update Participant Payload:', req.body); // DEBUG
        await participant.save();

        // Reload to ensure we return the committed DB state (including new columns)
        await participant.reload();

        console.log('Updated Participant Result:', participant.toJSON()); // DEBUG
        res.json(participant);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
