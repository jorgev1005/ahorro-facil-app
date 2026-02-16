const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const conn = new Client();

console.log('🔍 FINAL CONNECTION CHECK...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    const cmd = `
    echo "--- LISTENING PORTS (443) ---"
    ss -tulpn | grep :443
    
    echo "--- CURL TEST (HTTPS) ---"
    curl -I -k https://api.grupoaludra.com
    
    echo "--- CURL TEST (HTTP Redirect) ---"
    curl -I http://api.grupoaludra.com
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ FINAL CHECK DONE');
        }).on('data', (d) => console.log(d.toString()))
            .stderr.on('data', (d) => console.log('STDERR: ' + d));
    });
}).connect(config);
