const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const conn = new Client();

console.log('🚀 KILLING ZOMBIE PROCESS 1271357...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // 1. Kill the specific PID
    // 2. Kill any other node processes just in case
    // 3. Restart PM2 as 'ahorro' if possible, or just start new one as root (since we own the files now)

    // Note: If we run as root, we should fix file permissions too.

    const cmd = `
    echo "--- KILLING PID 1271357 ---"
    kill -9 1271357
    
    echo "--- CHECKING PORTS AFTER KILL ---"
    lsof -i :3000
    
    echo "--- RESTARTING PM2 AS ROOT (Takeover) ---"
    cd /var/www/ahorro_facil
    pm2 delete all
    pm2 start src/index.js --name ahorro-facil-api --update-env
    pm2 save
    
    echo "--- VERIFYING NEW PORT 3000 ---"
    sleep 3
    lsof -i :3000
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ KILL & RESTART DONE');
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
