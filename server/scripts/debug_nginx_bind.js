const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const conn = new Client();

console.log('🔍 CHECKING NGINX BINDING & CERTS...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // Check ports and read config
    const cmd = `
    echo "--- LISTENING PORTS (ALL) ---"
    ss -tulpn | grep nginx
    
    echo "--- SYMLINK CHECK ---"
    ls -la /etc/nginx/sites-enabled/
    
    echo "--- CERTIFICATE CHECK ---"
    ls -l /etc/letsencrypt/live/api.grupoaludra.com/
    
    echo "--- CONFIG CONTENT VERIFICATION ---"
    cat /etc/nginx/sites-enabled/api.grupoaludra.com
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ CHECK DONE');
        }).on('data', (d) => console.log(d.toString()))
            .stderr.on('data', (d) => console.log('STDERR: ' + d));
    });
}).connect(config);
