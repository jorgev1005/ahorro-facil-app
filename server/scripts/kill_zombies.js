const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🔍 Connecting to VPS to Kill Zombies...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    const cmd = `
    echo "--- KILLING 3000, 3001, 3002, 3005 ---"
    fuser -k 3000/tcp || echo "No 3000"
    fuser -k 3001/tcp || echo "No 3001"
    fuser -k 3002/tcp || echo "No 3002"
    fuser -k 3005/tcp || echo "No 3005"
    
    echo "\n--- CLEAN NPM INSTALL ---"
    cd ${REMOTE_DIR}
    rm -rf node_modules package-lock.json
    npm install
    
    # Restart App on 3001
    echo "Restarting App..."
    pm2 delete ahorro-facil-api || true
    PORT=3001 pm2 start src/index.js --name ahorro-facil-api --update-env
    pm2 save
    echo "App restarted."
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
