const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🔍 Connecting to VPS for Manual Port 3005...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    const cmd = `
    cd ${REMOTE_DIR}
    
    echo "--- ECOSYSTEM ---"
    cat ecosystem.config.js
    
    echo "\n--- STARTING NODE 3005 ---"
    PORT=3005 node src/index.js > app_3005.log 2>&1 &
    PID=$!
    sleep 5
    
    echo "\n--- CURL ROOT ---"
    curl -v http://127.0.0.1:3005/ || echo "Curl Root Failed"
    
    echo "\n--- CURL REGISTER ---"
    curl -v -X POST http://127.0.0.1:3005/api/auth/register \
         -H "Content-Type: application/json" \
         -d '{"name":"Test","email":"test3005@test.com","password":"123"}' || echo "Curl Register Failed"
    
    kill $PID
    echo "\n--- APP LOG ---"
    cat app_3005.log
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
