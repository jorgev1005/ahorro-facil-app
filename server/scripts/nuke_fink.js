const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🔍 Connecting to VPS ...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // Kill fink processes and rename folder
    const cmd = `
    echo "--- KILLING FINK ---"
    pkill -u fink || echo "Fink dead"
    killall -u fink || echo "Fink really dead"
    
    echo "--- RENAMING FINK BACKEND ---"
    if [ -d "/home/fink/backend" ]; then
        mv /home/fink/backend /home/fink/backend_disabled
        echo "Renamed backend to backend_disabled"
    else
        echo "backend folder not found or already disabled"
    fi
    
    # Verify 3001 is free
    echo "--- CHECKING 3001 ---"
    fuser -k 3001/tcp || echo "Port 3001 free"

    # Restart App on 3001
    cd ${REMOTE_DIR}
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
