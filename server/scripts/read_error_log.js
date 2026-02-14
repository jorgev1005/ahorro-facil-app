const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🔍 Connecting to VPS to Read Error Log...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // PM2 error log path is usually ~/.pm2/logs/APP_NAME-error.log
    // We'll try to find it
    const cmd = `
    echo "--- FIND LOG FILE ---"
    ls -l ~/.pm2/logs/ahorro-facil-api-error.log
    
    echo "\n--- TAIL ERROR LOG ---"
    tail -n 100 ~/.pm2/logs/ahorro-facil-api-error.log
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
