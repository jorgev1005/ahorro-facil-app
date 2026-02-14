const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const conn = new Client();

console.log('🔍 CHECKING DNS...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    const cmd = `
    echo "--- MY IP ---"
    curl -s ifconfig.me
    echo ""
    
    echo "--- NSLOOKUP ahorro.grupoaludra.com ---"
    getent hosts ahorro.grupoaludra.com
    
    echo "--- NSLOOKUP api.grupoaludra.com ---"
    getent hosts api.grupoaludra.com
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ DNS CHECK DONE');
        }).on('data', (d) => console.log(d.toString()))
            .stderr.on('data', (d) => console.log('STDERR: ' + d));
    });
}).connect(config);
