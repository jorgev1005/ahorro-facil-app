const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🚀 UPDATING NGINX TO PORT 3002...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // Nginx Config Template (Standard React + Express setup)
    const nginxConfig = `
server {
    listen 80;
    server_name ahorro.grupoaludra.com www.ahorro.grupoaludra.com;

    root /var/www/ahorro_facil/client/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3002;  # CHANGED TO 3002
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
`;

    const nginxBase64 = Buffer.from(nginxConfig).toString('base64');

    const cmd = `
    echo "--- WRITING NGINX CONFIG ---"
    echo "${nginxBase64}" | base64 -d > /etc/nginx/sites-available/ahorro_facil
    
    echo "--- TESTING NGINX CONFIG ---"
    nginx -t
    
    echo "--- RELOADING NGINX ---"
    systemctl reload nginx
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ NGINX UPDATE DONE');
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
