const express = require('express');
const cors = require('cors');
const app = express();
const passport = require('./config/passport'); // Import passport config

// Middleware
// Middleware (CORS configured for production)
app.use(cors({
    origin: true, // Allow any origin temporarily to rule out mismatch
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(passport.initialize()); // Initialize passport

// Basic Route for testing
app.get('/', (req, res) => {
    res.send('Ahorro Fácil API is running');
});

// Routes
const bolsoRoutes = require('./routes/bolsos');
const participantRoutes = require('./routes/participants');
const paymentRoutes = require('./routes/payments');
const paymentRoutes = require('./routes/payments');
const authRoutes = require('./routes/auth'); // Ensure this file exists and exports router
const publicRoutes = require('./routes/public');

app.use('/api/bolsos', bolsoRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', require('./routes/admin'));
app.use('/api/public', publicRoutes);

module.exports = app;
