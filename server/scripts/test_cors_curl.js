const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🔍 Connecting to VPS to Test CORS...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    const cmd = `
    echo "--- CURL WITH ORIGIN ---"
    curl -I -X OPTIONS https://api.grupoaludra.com/api/auth/register \
         -H "Origin: https://ahorro-facil-app.vercel.app" \
         -H "Access-Control-Request-Method: POST"
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
