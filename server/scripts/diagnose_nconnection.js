const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const conn = new Client();

console.log('🚑 DIAGNOSING NGINX CONNECTION...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    const cmd = `
    echo "--- NGINX STATUS ---"
    systemctl status nginx --no-pager
    
    echo "--- NGINX CONFIG TEST ---"
    nginx -t
    
    echo "--- SITES ENABLED ---"
    ls -l /etc/nginx/sites-enabled/
    
    echo "--- NGINX ERROR LOG ---"
    tail -n 20 /var/log/nginx/error.log
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ DIAGNOSTIC DONE');
        }).on('data', (d) => console.log(d.toString()))
            .stderr.on('data', (d) => console.log('STDERR: ' + d));
    });
}).connect(config);
