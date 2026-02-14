const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🔍 Connecting to VPS to Grep Logs...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    const cmd = `
    echo "--- SEARCHING ACCESS LOG FOR AHORRO DOMAINS ---"
    grep -E "ahorro.grupoaludra.com|ahorro-facil-app.vercel.app" /var/log/nginx/access.log | tail -n 20
    
    echo "\n--- SEARCHING ERROR LOG FOR SSL/CONNECTION ISSUES ---"
    grep -E "SSL_do_handshake|Connection refused" /var/log/nginx/error.log | tail -n 20
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
