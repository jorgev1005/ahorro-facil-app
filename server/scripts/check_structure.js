const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🔍 CHECKING STRUCTURE...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    conn.exec(`
        cd ${REMOTE_DIR}
        echo "--- LS -LA ---"
        ls -la
        
        echo "--- LS CLIENT ---"
        ls -la client
    `, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ DONE');
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
