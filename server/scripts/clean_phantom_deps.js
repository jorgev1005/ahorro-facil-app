const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🔍 Connecting to VPS to Clean Phantom Deps...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    const cmd = `
    cd ${REMOTE_DIR}
    
    echo "--- CHECKING PHANTOM ---"
    ls -d node_modules/require-in-the-middle || echo "Folder not found"
    
    echo "--- REMOVING PHANTOM ---"
    rm -rf node_modules/require-in-the-middle
    rm -rf node_modules/elastic-apm-node
    
    echo "--- VERIFYING MANUAL START 3001 ---"
    # Stop PM2 first
    pm2 stop ahorro-facil-api || true
    
    PORT=3001 node src/index.js &
    PID=$!
    sleep 5
    
    # Check if still running
    if ps -p $PID > /dev/null; then
        echo "✅ SERVER STARTED SUCCESSFULLY!"
        cat app.log || echo "No log"
        kill $PID
        
        # Now restart via PM2
        echo "Restarting via PM2..."
        PORT=3001 pm2 start src/index.js --name ahorro-facil-api --update-env
        pm2 save
    else
        echo "❌ SERVER CRASHED AGAIN"
    fi
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
