const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🔍 Connecting to VPS to Update App and Check Logs...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // Upload the new file content using cat
    const appJsContent = `const express = require('express');
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
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
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

    const cmd = `
    echo "--- WRITING NEW APP.JS ---"
    cat > ${REMOTE_DIR}/src/app.js <<EOF
${appJsContent}
EOF

    echo "--- RESTARTING APP ---"
    pm2 restart ahorro-facil-api
    
    echo "--- CHECKING PM2 ERROR LOGS (Last 50 lines) ---"
    pm2 logs ahorro-facil-api --nostream --lines 50 2>&1 | grep -v "PM2" || echo "No logs found"
    
     echo "--- CHECKING NGINX ACCESS LOGS (Last 20) for OPTIONS ---"
    tail -n 20 /var/log/nginx/access.log | grep "OPTIONS" || echo "No OPTIONS requests seen"
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });

}).connect(config);
