const { Client } = require('ssh2');
const dns = require('dns');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const conn = new Client();

console.log('🔍 Deep Debugging...');

// Check DNS first
dns.lookup('api.grupoaludra.com', (err, address, family) => {
    console.log('DNS Resolution:', address);
});

conn.on('ready', () => {
    console.log('✅ Connected.');

    const cmd = `
    echo "--- NGINX ENABLED ---"
    ls -l /etc/nginx/sites-enabled/
    
    echo "\n--- LISTENING PORTS (ss) ---"
    ss -lptn
    
    echo "\n--- PM2 LIST ---"
    pm2 jlist
    
    echo "\n--- CURL LOCALHOST:3001 ---"
    curl -v http://127.0.0.1:3001 || echo "Curl failed"
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
