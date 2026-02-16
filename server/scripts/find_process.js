const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const conn = new Client();

console.log('🕵️‍♂️ FINDING RUNNING PROCESS...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    const cmd = `
    echo "--- PM2 LIST ---"
    pm2 list
    
    echo "\n--- PROCESS LIST (NODE) ---"
    ps aux | grep node
    
    echo "\n--- FINDING SERVER DIR ---"
    find /var/www -maxdepth 3 -type d -name "server"
    
    echo "\n--- CHECKING PM2 ENV ---"
    # Inspect the environment of the running process 0
    pm2 env 0 | grep -E "PWD|JWT_SECRET"
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ FIND DONE');
        }).on('data', (d) => console.log(d.toString()))
            .stderr.on('data', (d) => console.log('STDERR: ' + d));
    });
}).connect(config);
