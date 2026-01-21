const express = require('express');
const router = express.Router();
const { Payment, Bolso } = require('../models');

// POST /api/payments
// Creates or Updates a payment
router.post('/', async (req, res) => {
    try {
        const {
            bolsoId,
            participantId,
            scheduledDate,
            amountToPay, // Amount being paid NOW
            paymentDetails // { date, reference, currency, exchangeRate, amountBs }
        } = req.body;

        const bolso = await Bolso.findByPk(bolsoId);
        if (!bolso) return res.status(404).json({ error: 'Bolso not found' });

        // Find existing payment
        let payment = await Payment.findOne({
            where: {
                bolsoId,
                participantId,
                scheduledDate
            }
        });

        const totalExpected = parseFloat(bolso.amount);
        const inAmount = parseFloat(amountToPay);

        if (payment) {
            // Update existing (Partial -> Full or Partial -> Partial)
            const prevPaid = parseFloat(payment.amountPaid);
            const newPaidTotal = prevPaid + inAmount;
            const isFullyPaid = newPaidTotal >= totalExpected;

            payment.amountPaid = newPaidTotal;
            payment.status = isFullyPaid ? 'paid' : 'partial';
            payment.paidAt = paymentDetails.date;
            payment.reference = paymentDetails.reference;
            payment.currency = paymentDetails.currency;
            payment.exchangeRate = paymentDetails.exchangeRate;
            payment.amountBs = paymentDetails.amountBs;

            await payment.save();
        } else {
            // Create new
            const isFullyPaid = inAmount >= totalExpected;

            payment = await Payment.create({
                bolsoId,
                participantId,
                scheduledDate,
                amountPaid: inAmount,
                status: isFullyPaid ? 'paid' : 'partial',
                paidAt: paymentDetails.date,
                reference: paymentDetails.reference,
                currency: paymentDetails.currency,
                exchangeRate: paymentDetails.exchangeRate,
                amountBs: paymentDetails.amountBs,
                receiptStatus: 'generated'
            });
        }

        res.json(payment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// DELETE /api/payments/:id
router.delete('/:id', async (req, res) => {
    try {
        const result = await Payment.destroy({ where: { id: req.params.id } });
        if (result === 0) return res.status(404).json({ error: 'Payment not found' });
        res.json({ message: 'Payment deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});


module.exports = router;
