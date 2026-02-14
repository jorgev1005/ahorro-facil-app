const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🚀 Connecting to VPS for QUICK DEPLOY...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    const cmd = `
    cd ${REMOTE_DIR}
    echo "--- PULLING LATEST CODE ---"
    git pull origin main
    
    echo "--- RESTARTING SERVER ---"
    pm2 restart all
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            if (code === 0) console.log('✅ DEPLOY SUCCESSFUL');
            else console.error('❌ DEPLOY FAILED');
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
