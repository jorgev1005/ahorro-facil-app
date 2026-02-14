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

console.log('🚀 Connecting to VPS for MANUAL UPLOAD (PUBLIC.JS)...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // Read local file
    let publicJs = fs.readFileSync(path.join(LOCAL_SERVER_DIR, 'src/routes/public.js'), 'utf8');

    // Inject Logging
    publicJs = publicJs.replace(
        `return res.status(401).json({ error: 'Enlace inválido o expirado' });`,
        `console.error('❌ JWT Verify Error:', e.message); return res.status(401).json({ error: 'Enlace inválido o expirado' });`
    );

    const publicBase64 = Buffer.from(publicJs).toString('base64');

    const cmd = `
    cd ${REMOTE_DIR}
    echo "--- UPLOADING public.js ---"
    echo "${publicBase64}" | base64 -d > src/routes/public.js
    
    // Also restart PM2 to apply changes
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
