const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🔍 Connecting to VPS to Check Access Logs...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    const cmd = `
    echo "--- LAST 20 LINES OF NGINX ACCESS LOG ---"
    tail -n 20 /var/log/nginx/access.log
    
    echo "\n--- LAST 20 LINES OF NGINX ERROR LOG ---"
    tail -n 20 /var/log/nginx/error.log
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
