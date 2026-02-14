const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🔍 Connecting to VPS to Fix Syntax...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // Command to fix and restart
    const cmd = `
    cd ${REMOTE_DIR}
    
    echo "--- FIXING APP.JS ---"
    # Remove the second occurrence or duplicate line
    # We can just remove line 24 if we know it's there
    # Or use uniq? But lines might not be adjacent?
    # They are adjacent in my view_file output.
    # "const paymentRoutes = require('./routes/payments');"
    
    sed -i '24d' src/app.js
    
    echo "--- VERIFYING APP.JS ---"
    cat src/app.js
    
    # Restart App on 3001
    echo "Restarting App..."
    pm2 delete ahorro-facil-api || true
    PORT=3001 pm2 start src/index.js --name ahorro-facil-api --update-env
    pm2 save
    echo "App restarted."
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
