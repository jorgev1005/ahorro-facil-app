const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

// Route to start Google Auth
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// Callback route
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    (req, res) => {
        // Successful authentication, redirect home with token
        const token = jwt.sign(
            {
                id: req.user.id,
                email: req.user.email,
                role: req.user.role,
                name: req.user.name,
                isAdmin: req.user.isAdmin
            },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Determine frontend URL based on environment (or hardcode based on user's setup)
        // Currently user uses api.grupoaludra.com for frontend in prod
        // But frontend is actually served statically OR on Vercel. 
        // Based on Phase 16, Frontend is on Vercel/GitHub pages but also deployed to VPS as static?
        // Let's assume the frontend will catch the token from query params.

        // Redirect to Frontend with Token
        // Using a relative path if served from same domain, or absolute if separate.
        // Assuming SPA handles routing at /

        res.redirect(`https://ahorro.grupoaludra.com/?token=${token}`);
    }
);

module.exports = router;
