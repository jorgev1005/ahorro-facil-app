const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const conn = new Client();

console.log('🔍 CHECKING PUBLIC LINK LOGS...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    const cmd = `
    echo "--- PM2 ERROR LOGS (Last 50) ---"
    tail -n 50 /root/.pm2/logs/ahorro-api-3002-error.log
    
    echo "--- PM2 OUT LOGS (Last 20) ---"
    tail -n 20 /root/.pm2/logs/ahorro-api-3002-out.log
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ LOGS FETCHED');
        }).on('data', (d) => console.log(d.toString()))
            .stderr.on('data', (d) => console.log('STDERR: ' + d));
    });
}).connect(config);
