const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🔍 CHECKING API HEALTH...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    const cmd = `
    echo "--- CURL LOCALHOST:3000 ---"
    curl -v http://localhost:3000
    
    echo "--- CURL LOCALHOST:3000/api/public/participant/TEST_TOKEN ---"
    curl -v http://localhost:3000/api/public/participant/TEST_TOKEN
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ HEALTH CHECK DONE');
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
