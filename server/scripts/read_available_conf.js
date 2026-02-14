const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const conn = new Client();

console.log('🔍 READING AVAILABLE CONFIG...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    conn.exec(`cat /etc/nginx/sites-available/api.grupoaludra.com`, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ READ DONE');
        }).on('data', (d) => console.log(d.toString()))
            .stderr.on('data', (d) => console.log('STDERR: ' + d));
    });
}).connect(config);
