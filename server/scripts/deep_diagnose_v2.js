const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const conn = new Client();

console.log('🚑 DEEP DIAGNOSIS & RESTART...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // SS to check ports, UFW, and Force Restart
    const cmd = `
    echo "--- LISTENING PORTS (SS) ---"
    ss -tulpn | grep :443
    
    echo "--- FIREWALL STATUS ---"
    ufw status verbose
    
    echo "--- MEMORY CHECK ---"
    free -h
    
    echo "--- RESTARTING NGINX FORCEFULLY ---"
    systemctl stop nginx
    sleep 2
    systemctl start nginx
    systemctl status nginx --no-pager
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ DONE');
        }).on('data', (d) => console.log(d.toString()))
            .stderr.on('data', (d) => console.log('STDERR: ' + d));
    });
}).connect(config);
