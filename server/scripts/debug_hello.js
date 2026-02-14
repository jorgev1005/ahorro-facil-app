const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🔍 Connecting to VPS for Hello World...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // Simple script
    const script = `console.log("HELLO FROM NODE"); process.exit(0);`;

    conn.exec(`echo '${script}' > ${REMOTE_DIR}/debug_hello.js`, (err, stream) => {
        if (err) throw err;
        stream.on('close', () => {
            conn.exec(`cd ${REMOTE_DIR} && node debug_hello.js`, (err, stream) => {
                if (err) throw err;
                stream.on('data', (data) => console.log('STDOUT: ' + data.toString()))
                    .stderr.on('data', (data) => console.log('STDERR: ' + data.toString()));
                stream.on('close', (code) => {
                    console.log('Exited with ' + code);
                    conn.end();
                });
            });
        });
    });
}).connect(config);
