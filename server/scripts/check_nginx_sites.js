const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const conn = new Client();

console.log('🔍 CHECKING NGINX SITES...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    conn.exec(`
        echo "--- SITES-ENABLED ---"
        ls -l /etc/nginx/sites-enabled/
        
        echo "--- CONTENT OF DEFAULT (if exists) ---"
        # Check if 'default' or other files exist and look inside them
        grep -r "ahorro.grupoaludra.com" /etc/nginx/sites-enabled/
    `, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ DONE');
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
