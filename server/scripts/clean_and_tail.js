const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const conn = new Client();

console.log('🕵️‍♂️ CLEANING & TAILING LOGS...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // 1. Remove the CONFUSING 'server' directory that I created by mistake
    // 2. Restart PM2 one more time to be sure
    // 3. Tail logs
    const cmd = `
    echo "--- CLEANING UP ---"
    rm -rf /var/www/ahorro_facil/server
    
    echo "--- RESTARTING PM2 ---"
    pm2 restart all
    
    echo "--- TAILING LOGS (Waiting for Request - 60s) ---"
    timeout 60s pm2 logs --nostream --lines 0 | grep -v "PM2"
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ DONE');
        }).on('data', (d) => console.log(d.toString()))
            .stderr.on('data', (d) => console.log('STDERR: ' + d));
    });
}).connect(config);
