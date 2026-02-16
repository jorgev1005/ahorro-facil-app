const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const conn = new Client();

console.log('🔍 CHECKING LOGIN ATTEMPTS...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // Check ports and read config
    const cmd = `
    echo "--- PM2 LOGS (Last 50) ---"
    pm2 logs ahorro-api-3002 --lines 50 -err
    
    echo "--- NGINX ERRORS (Last 50) ---"
    tail -n 50 /var/log/nginx/error.log
    
    echo "--- POSTS TO BACKEND ---"
    grep "POST /api/auth/login" /root/.pm2/logs/ahorro-api-3002-out.log | tail -n 10
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ CHECK DONE');
        }).on('data', (d) => console.log(d.toString()))
            .stderr.on('data', (d) => console.log('STDERR: ' + d));
    });
}).connect(config);
