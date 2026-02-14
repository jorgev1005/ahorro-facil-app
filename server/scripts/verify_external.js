const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const conn = new Client();

console.log('🔍 VERIFYING PUBLIC URL...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // Curl the public domain
    // Note: If SSL is invalid locally (it shouldn't be if it's LetsEncrypt), we might need -k
    // But better to check without -k first.

    conn.exec(`
        echo "--- CURL PUBLIC DOMAIN (PING) ---"
        curl -v https://ahorro.grupoaludra.com/api/public/ping
    `, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ VERIFICATION DONE');
        }).on('data', (d) => console.log(d.toString()))
            .stderr.on('data', (d) => console.log('STDERR: ' + d));
    });
}).connect(config);
