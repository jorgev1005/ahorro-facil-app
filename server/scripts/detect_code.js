const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🔍 DETECTIVE SCRIPT...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    const cmd = `
    cd ${REMOTE_DIR}
    
    echo "--- LIST ALL FILES ---"
    ls -F
    
    echo "--- SEARCH FOR HELMET ---"
    grep -r "helmet" .
    
    echo "--- SEARCH FOR Content-Security-Policy ---"
    grep -r "Content-Security-Policy" .
    
    echo "--- CHECK NODE_MODULES FOR HELMET ---"
    ls node_modules/helmet
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ DETECTION DONE');
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
