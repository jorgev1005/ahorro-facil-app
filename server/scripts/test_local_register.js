const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🔍 Connecting to VPS to Test Register Locally...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // Command to Curl local registration
    // We use a random email to ensure unique
    const cmd = `
    echo "--- CURL REGISTER LOCAL ---"
    EMAIL="test_$(date +%s)@test.com"
    curl -v -X POST http://127.0.0.1:3001/api/auth/register \
         -H "Content-Type: application/json" \
         -d "{\\"name\\":\\"Test Local\\",\\"email\\":\\"$EMAIL\\",\\"password\\":\\"123456\\"}"
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
