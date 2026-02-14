const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🔍 Connecting to VPS to Check Env...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // Command to check and fix .env
    const cmd = `
    cd ${REMOTE_DIR}
    
    echo "--- CAT .ENV ---"
    cat .env
    
    # Check if JWT_SECRET is present
    if grep -q "JWT_SECRET" .env; then
        echo "JWT_SECRET found."
    else
        echo "JWT_SECRET MISSING within .env! Appending..."
        echo "JWT_SECRET=supersecretkey_$(date +%s)" >> .env
        echo "Added JWT_SECRET."
        
        # Restart App
        pm2 restart ahorro-facil-api --update-env
        echo "App restarted."
    fi
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
