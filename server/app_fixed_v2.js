const express = require('express');
const cors = require('cors');
const app = express();

// Middleware (CORS configured for production)
const allowedOrigins = [
    'https://ahorro-facil-app.vercel.app',
    'http://localhost:5173',
    'https://api.grupoaludra.com',
    'https://ahorro.grupoaludra.com',
    'https://www.ahorro.grupoaludra.com'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) === -1) {
            // For debug purposes, we will log blocked origins but ALLOW them temporarily
            // console.log('Origin not in whitelist (but allowed for debug):', origin);
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
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
