const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const conn = new Client();

console.log('🔍 VERIFYING API DOMAIN...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    conn.exec(`
        echo "--- CURL API DOMAIN (PING) ---"
        curl -v https://api.grupoaludra.com/api/public/ping
    `, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ VERIFICATION DONE');
        }).on('data', (d) => console.log(d.toString()))
            .stderr.on('data', (d) => console.log('STDERR: ' + d));
    });
}).connect(config);
