const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🔍 Connecting to VPS to Fix Deployment...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // 1. New Nginx Config
    const nginxConf = `
server {
    listen 80;
    server_name api.grupoaludra.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
    `;

    // 2. Command to apply fixes
    const cmd = `
    # Update Nginx
    echo "${nginxConf.replace(/\$/g, '\\$').replace(/"/g, '\\"')}" > /etc/nginx/sites-available/ahorro-facil
    ln -sf /etc/nginx/sites-available/ahorro-facil /etc/nginx/sites-enabled/
    nginx -t && systemctl reload nginx
    console.log('Nginx updated.');

    # Restart App on Port 3001
    cd ${REMOTE_DIR}
    pm2 delete ahorro-facil-api || true
    PORT=3001 pm2 start src/index.js --name ahorro-facil-api --update-env
    pm2 save
    console.log('App restarted on 3001.');
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
