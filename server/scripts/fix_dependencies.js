const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🔍 Connecting to VPS to Install Dependencies...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // Command to install and verify
    const cmd = `
    cd ${REMOTE_DIR}
    
    echo "--- NPM INSTALL ---"
    npm install
    
    echo "\n--- SRC/APP.JS ---"
    cat src/app.js
    
    echo "\n--- SRC/INDEX.JS ---"
    cat src/index.js
    
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
