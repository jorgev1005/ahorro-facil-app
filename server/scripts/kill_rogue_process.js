const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🔍 Connecting to VPS to Kill Rogue Fink Process...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // Kill PID 1271363 and any other node process by fink
    const cmd = `
    echo "--- KILLING ROGUE PROCESS ---"
    kill -9 1271363 || echo "Process already dead"
    pkill -u fink node || echo "No other fink node processes"
    
    # Verify port 3001 is free
    echo "--- CHECKING PORT 3001 ---"
    lsof -i :3001 || echo "Port 3001 is free"

    # Restart App on 3001
    cd ${REMOTE_DIR}
    echo "Restarting App on 3001..."
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
