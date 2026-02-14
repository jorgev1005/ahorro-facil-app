const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🔍 CHECKING PORTS & PROCESSES...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // Check listening ports and process details
    const cmd = `
    echo "--- PORT 3000 LISTENER ---"
    lsof -i :3000
    
    echo "--- PORT 3001 LISTENER ---"
    lsof -i :3001
    
    echo "--- ALL NODE PROCESSES ---"
    ps aux | grep node
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ PORT CHECK DONE');
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
