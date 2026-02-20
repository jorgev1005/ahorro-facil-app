const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const conn = new Client();

console.log('🚀 CONFIGURING GOOGLE AUTH ON VPS...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    const cmd = `
    echo "--- BACKING UP .ENV ---"
    cp /home/ahorro/server/.env /home/ahorro/server/.env.bak
    
    echo "--- INJECTING CREDENTIALS ---"
    # Check if already exists to avoid duplicates (simple check)
    if grep -q "GOOGLE_CLIENT_ID" /home/ahorro/server/.env; then
        echo "Google Credentials already exist. Skipping append."
    else
        echo "" >> /home/ahorro/server/.env
        echo "GOOGLE_CLIENT_ID=YOUR_CLIENT_ID" >> /home/ahorro/server/.env
        echo "GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET" >> /home/ahorro/server/.env
        echo "Credentials appended."
    fi

    echo "--- RESTARTING PM2 ---"
    pm2 restart all
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ CONFIGURATION FINALIZED');
        }).on('data', (d) => console.log(d.toString()))
            .stderr.on('data', (d) => console.log('STDERR: ' + d));
    });

}).connect(config);
