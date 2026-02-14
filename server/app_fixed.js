const express = require('express');
const cors = require('cors');
const app = express();

// Middleware (CORS configured for production)
app.use(cors({
    origin: ['https://ahorro-facil-app.vercel.app', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
}));
app.use(express.json());

// Basic Route for testing
app.get('/', (req, res) => {
    res.send('Ahorro Fácil API is running');
});

// Routes
const bolsoRoutes = require('./routes/bolsos');
const participantRoutes = require('./routes/participants');
const paymentRoutes = require('./routes/payments');
const authRoutes = require('./routes/auth');
const publicRoutes = require('./routes/public');

app.use('/api/bolsos', bolsoRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);

module.exports = app;
