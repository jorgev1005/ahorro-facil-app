const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Bolso, Participant, Payment } = require('../models');

// GET /api/public/participant/:token
router.get('/participant/:token', async (req, res) => {
    try {
        const { token } = req.params;

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (e) {
            return res.status(401).json({ error: 'Enlace inválido o expirado' });
        }

        const { participantId } = decoded;

        // Fetch Participant details
        const participant = await Participant.findOne({
            where: { id: participantId },
            include: [{
                model: Payment,
                // attributes: ['id', 'amountPaid', 'date', 'reference', 'currency', 'amountBs', 'exchangeRate'] 
            }]
        });

        if (!participant) {
            return res.status(404).json({ error: 'Participante no encontrado' });
        }

        // Fetch Bolso Summary (Limited info)
        const bolso = await Bolso.findByPk(participant.bolsoId, {
            attributes: ['id', 'name', 'amount', 'startDate', 'frequency', 'duration', 'schedule']
        });

        if (!bolso) {
            return res.status(404).json({ error: 'Bolso no encontrado' });
        }

        res.json({
            participant,
            bolso
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
