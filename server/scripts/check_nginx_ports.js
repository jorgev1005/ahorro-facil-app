const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const conn = new Client();

console.log('🔍 CHECKING NGINX PORTS & CONFIG...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // Check ports and read config
    const cmd = `
    echo "--- NETSTAT (Listening Ports) ---"
    netstat -tulpn | grep nginx
    
    echo "--- CONFIG CONTENT ---"
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
