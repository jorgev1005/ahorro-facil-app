const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🔍 Connecting to VPS to Test Public Register...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // Command to Curl Public Registration
    const cmd = `
    echo "--- CAT APP.JS (Check Root Route) ---"
    grep -A 3 "app.get('/'," src/app.js || echo "Root route not found in grep"
    
    echo "\n--- CURL PUBLIC REGISTER ---"
    EMAIL="test_pub_$(date +%s)@test.com"
    curl -v -X POST https://api.grupoaludra.com/api/auth/register \
         -H "Content-Type: application/json" \
         -d "{\\"name\\":\\"Test Public\\",\\"email\\":\\"$EMAIL\\",\\"password\\":\\"123456\\"}"
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
