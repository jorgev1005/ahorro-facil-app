const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🔍 Connecting to VPS to check SSL Nginx Config...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    const cmd = `
    echo "--- LISTING SITES ---"
    ls -l /etc/nginx/sites-enabled/
    
    echo "\n--- READING CONFIG ---"
    # We saw a symlink to api.grupoaludra.com in previous output
    cat /etc/nginx/sites-enabled/api.grupoaludra.com || cat /etc/nginx/sites-enabled/ahorro-facil
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
