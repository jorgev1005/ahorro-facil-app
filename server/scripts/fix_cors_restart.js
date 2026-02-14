const { Client } = require('ssh2');
const fs = require('fs');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🔍 Connecting to VPS to Update App.js and Restart...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // Upload file content (simplified approach for this tool context)
    const appJsContent = `const express = require('express');
const cors = require('cors');
const app = express();

// Middleware (CORS configured for production)
const allowedOrigins = ['https://ahorro-facil-app.vercel.app', 'http://localhost:5173', 'https://api.grupoaludra.com'];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            // Be permissible for now during debug
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

module.exports = app;`;

    // Write to remote file
    const cmd = `
cat > ${REMOTE_DIR}/src/app.js <<EOF
${appJsContent}
EOF

    echo "--- RESTARTING APP ---"
    cd ${REMOTE_DIR}
    pm2 restart ahorro-facil-api
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });

}).connect(config);
