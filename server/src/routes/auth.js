const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Route to start Google Auth
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// Local Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Por favor, completa todos los campos' });
        }

        // Check if user exists
        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ error: 'El usuario ya existe' });
        }
        
        const user = await User.create({ name, email, password });
        
        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );
        
        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
});

// Local Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Por favor, proporciona email y contraseña' });
        }
        
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
        if (!user.password && user.googleId) {
             return res.status(401).json({ error: 'Esta cuenta fue registrada con Google. Por favor usa Iniciar Sesión con Google.' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );
        
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});

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
