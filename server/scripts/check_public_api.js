const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🔍 Connecting to VPS to check Domain & Nginx...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    const cmd = `
    echo "--- CURL LOCALHOST:3001 ---"
    curl -I http://127.0.0.1:3001/
    
    echo "\n--- NGINX SITES ENABLED ---"
    ls -l /etc/nginx/sites-enabled/
    
    echo "\n--- CAT DEFAULT SITE ---"
    cat /etc/nginx/sites-enabled/default || echo "No default"
    
    echo "\n--- CAT AHORRO-FACIL SITE ---"
    cat /etc/nginx/sites-enabled/ahorro-facil || echo "No ahorro-facil"
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
