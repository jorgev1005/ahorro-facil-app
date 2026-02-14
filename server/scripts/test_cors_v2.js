const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🔍 Connecting to VPS to Test CORS V2...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // Explicitly ask for headers only with -i (include headers) and -v (verbose)
    const cmd = `
    echo "--- CURL OPTIONS with Origin ---"
    curl -v -X OPTIONS https://api.grupoaludra.com/api/auth/register \
         -H "Origin: https://ahorro-facil-app.vercel.app" \
         -H "Access-Control-Request-Method: POST" \
         -H "Access-Control-Request-Headers: Content-Type"
         
    echo "\n--- NGINX ERROR LOG ---"
    tail -n 20 /var/log/nginx/error.log
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
