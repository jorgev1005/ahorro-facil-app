const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const conn = new Client();

console.log('🔍 Connecting to VPS to read logs...');

conn.on('ready', () => {
    console.log('✅ Connected. Fetching PM2 logs...');

    // Read last 100 lines of error and out logs
    conn.exec('pm2 logs ahorro-facil-api --lines 50 --nostream', (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => console.log('STDOUT: ' + data))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
