const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const conn = new Client();

console.log('🚑 DIAGNOSING CRASH...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    const cmd = `
    echo "--- NGINX STATUS ---"
    systemctl status nginx --no-pager
    
    echo "--- NGINX CONFIG CHECK ---"
    nginx -t
    
    echo "--- PM2 STATUS ---"
    pm2 status
    
    echo "--- BACKEND CURL ---"
    curl -I http://localhost:3002/api/public/ping
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ DIAGNOSTIC DONE');
        }).on('data', (d) => console.log(d.toString()))
            .stderr.on('data', (d) => console.log('STDERR: ' + d));
    });
}).connect(config);
