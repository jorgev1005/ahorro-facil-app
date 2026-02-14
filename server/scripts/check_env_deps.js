const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🔍 Connecting to VPS to Check Env & Deps...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // Check Env and Npm list
    const cmd = `
    cd ${REMOTE_DIR}
    
    echo "--- ENV ---"
    env | grep NODE
    
    echo "\n--- NPM LIST ---"
    npm list require-in-the-middle || echo "Not found in tree"
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
