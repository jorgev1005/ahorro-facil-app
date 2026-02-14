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
const LOCAL_SERVER_DIR = path.join(__dirname, '..'); // d:\...\server

const conn = new Client();

console.log('🚀 Connecting to VPS for MANUAL UPLOAD...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // Read local files
    const authJs = fs.readFileSync(path.join(LOCAL_SERVER_DIR, 'src/routes/auth.js'), 'utf8');
    const bolsosJs = fs.readFileSync(path.join(LOCAL_SERVER_DIR, 'src/routes/bolsos.js'), 'utf8');

    // Escape for echo/cat (simplest is to use hex encoding or base64 to avoid char escaping issues)
    // using base64 is safest.
    const authBase64 = Buffer.from(authJs).toString('base64');
    const bolsosBase64 = Buffer.from(bolsosJs).toString('base64');

    const cmd = `
    cd ${REMOTE_DIR}
    
    echo "--- UPLOADING auth.js ---"
    echo "${authBase64}" | base64 -d > src/routes/auth.js
    
    echo "--- UPLOADING bolsos.js ---"
    echo "${bolsosBase64}" | base64 -d > src/routes/bolsos.js
    
    echo "--- RESTARTING SERVER ---"
    pm2 restart all
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            if (code === 0) console.log('✅ MANUAL DEPLOY SUCCESSFUL');
            else console.error('❌ DEPLOY FAILED');
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
