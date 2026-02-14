const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🔍 Connecting to VPS for Manual Run...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    const cmd = `
    cd ${REMOTE_DIR}
    
    # 1. Stop PM2 to free port (or use 3002)
    pm2 stop ahorro-facil-api || true
    
    # 2. Check auth.js content
    echo "--- REMOTE AUTH.JS CONTENT ---"
    cat src/routes/auth.js
    
    # 3. Start Node manually on 3002
    echo "\n--- STARTING NODE 3002 ---"
    PORT=3002 node src/index.js > app.log 2>&1 &
    PID=$!
    sleep 5
    
    # 4. Curl
    echo "\n--- CURL LOCALHOST:3002 REGISTER ---"
    curl -v -X POST http://127.0.0.1:3002/api/auth/register \
         -H "Content-Type: application/json" \
         -d '{"name":"Test","email":"test@test.com","password":"123"}' || echo "Curl failed"
    
    # 5. Kill Node
    kill $PID
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
