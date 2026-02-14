const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';
const LOCAL_SERVER_DIR = path.join(__dirname, '..');

const conn = new Client();

console.log('🚀 Connecting to VPS for MANUAL UPLOAD (PARTICIPANTS.JS)...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // Read local file
    const participantsJs = fs.readFileSync(path.join(LOCAL_SERVER_DIR, 'src/routes/participants.js'), 'utf8');

    // Base64 encode
    const participantsBase64 = Buffer.from(participantsJs).toString('base64');

    const cmd = `
    cd ${REMOTE_DIR}
    echo "--- UPLOADING participants.js ---"
    echo "${participantsBase64}" | base64 -d > src/routes/participants.js
    
    // Restart PM2
    pm2 restart all
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ UPLOAD & RESTART DONE');
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
