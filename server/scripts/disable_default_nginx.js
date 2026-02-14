const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const conn = new Client();

console.log('🔍 Connecting to VPS to Disable Default Site...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    const cmd = `
    # Check if default exists
    if [ -f /etc/nginx/sites-enabled/default ]; then
        echo "Disabling default site..."
        unlink /etc/nginx/sites-enabled/default
    else
        echo "Default site already disabled."
    fi

    # Ensure ahorro-facil link exists
    if [ ! -f /etc/nginx/sites-enabled/ahorro-facil ]; then
        echo "Linking ahorro-facil..."
        ln -s /etc/nginx/sites-available/ahorro-facil /etc/nginx/sites-enabled/
    fi

    # Test and Reload
    nginx -t
    systemctl reload nginx
    echo "Nginx Reloaded."
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
