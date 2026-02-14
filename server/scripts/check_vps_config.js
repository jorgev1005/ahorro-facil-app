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
    echo "--- PM2 LIST ---"
    pm2 list
    echo "\n--- PORTS ---"
    netstat -lpnt | grep node
    echo "\n--- NGINX CONFIG ---"
    grep -r "proxy_pass" /etc/nginx/sites-enabled/
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
