const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const conn = new Client();

console.log('🔍 FETCHING AUTH CONTROLLER...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    conn.exec('cat /var/www/ahorro_facil/server/src/controllers/authController.js', (err, stream) => {
        if (err) {
            console.error('File not found? Checking directory first.');
            conn.exec('ls -R src/', (e, s) => {
                s.pipe(process.stdout);
            });
        } else {
            stream.on('data', (d) => console.log(d.toString()));
        }
    });

}).connect(config);
