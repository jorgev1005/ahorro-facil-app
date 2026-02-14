const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const conn = new Client();

console.log('🔍 Connecting to VPS to check Config...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // Check Nginx config and PM2 list
    const cmd = `
    echo "--- NGIX SITES ---"
    ls -l /etc/nginx/sites-enabled/
    echo "\n--- PORTS (ss) ---"
    ss -lptn | grep node
    echo "\n--- PM2 JSON ---"
    pm2 jlist
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
