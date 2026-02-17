const { User } = require('../models');

// Middleware to check if user has active subscription
const checkSubscription = async (req, res, next) => {
    try {
        // Skip for admins
        if (req.user.isAdmin) {
            return next();
        }

        // GET requests are allowed (Read-only mode for expired users)
        // Adjust this if you want to block read access too
        if (req.method === 'GET') {
            return next();
        }

        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const now = new Date();
        const endsAt = user.subscriptionEndsAt ? new Date(user.subscriptionEndsAt) : null;

        const isActive = user.subscriptionStatus === 'active' || (endsAt && endsAt > now);

        if (!isActive) {
            return res.status(403).json({
                error: 'Suscripción vencida. Contacte al administrador para renovar.',
                subscriptionStatus: user.subscriptionStatus,
                subscriptionEndsAt: user.subscriptionEndsAt
            });
        }

        next();
    } catch (error) {
        console.error('Subscription Check Error:', error);
        res.status(500).json({ error: 'Server Error checking subscription' });
    }
};

module.exports = { checkSubscription };
