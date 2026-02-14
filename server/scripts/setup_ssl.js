const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🔍 Connecting to VPS to Setup SSL...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    const cmd = `
    # Install Certbot if not present
    if ! command -v certbot &> /dev/null; then
        echo "--- INSTALLING CERTBOT ---"
        apt-get update
        apt-get install -y certbot python3-certbot-nginx
    else
        echo "--- CERTBOT ALREADY INSTALLED ---"
    fi
    
    # Run Certbot for api.grupoaludra.com
    echo "--- RUNNING CERTBOT ---"
    # Non-interactive mode
    certbot --nginx -d api.grupoaludra.com --non-interactive --agree-tos -m jorge.verenzuela@gmail.com --redirect
    
    echo "--- RELOADING NGINX ---"
    systemctl reload nginx
    
    echo "--- VERIFYING SSL ---"
    curl -I https://api.grupoaludra.com
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
