const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { protect } = require('../middleware/auth');

// Middleware to check if user is admin
const adminOnly = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ error: 'Not authorized as admin' });
    }
};

// GET /api/admin/users - List all users
router.get('/users', protect, adminOnly, async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']]
        });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// PUT /api/admin/users/:id/subscription - Update subscription
router.put('/users/:id/subscription', protect, adminOnly, async (req, res) => {
    try {
        const { status, durationDays } = req.body; // status: 'active', 'inactive'. durationDays: 30, 365

        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (status) user.subscriptionStatus = status;

        if (durationDays) {
            const currentExpiry = user.subscriptionEndsAt && new Date(user.subscriptionEndsAt) > new Date()
                ? new Date(user.subscriptionEndsAt)
                : new Date();

            // Add days to current expiry or now
            const newExpiry = new Date(currentExpiry);
            newExpiry.setDate(newExpiry.getDate() + parseInt(durationDays));
            user.subscriptionEndsAt = newExpiry;

            // Auto-activate if adding time
            if (user.subscriptionStatus !== 'active') {
                user.subscriptionStatus = 'active';
            }
        }

        await user.save();
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// POST /api/admin/users/:id/notify - Send manual notification
router.post('/users/:id/notify', protect, adminOnly, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const endsAt = user.subscriptionEndsAt ? new Date(user.subscriptionEndsAt).toLocaleDateString() : 'N/A';

        const { sendEmail } = require('../services/mailer');
        await sendEmail({
            to: user.email,
            subject: 'Aviso Importante: Estado de tu Suscripción en Ahorro Fácil',
            html: `
                <h2>¡Hola ${user.name || ''}!</h2>
                <p>Este es un aviso administrativo referente a tu cuenta en <b>Ahorro Fácil</b>.</p>
                <p>Tu periodo de acceso a la plataforma está programado para vencer el día <b>${endsAt}</b>.</p>
                <p>Si deseas renovar o tienes alguna duda, comunícate con el administrador a la brevedad posible para evitar interrupciones en el servicio.</p>
                <br/>
                <p>Saludos,<br/>El equipo de Ahorro Fácil</p>
            `
        });

        res.json({ message: 'Notification sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
