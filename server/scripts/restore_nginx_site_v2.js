const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const conn = new Client();

console.log('🚀 RESTORING NGINX SITE V2...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // Correct Nginx Config
    const nginxConf = `
server {
    listen 80;
    server_name api.grupoaludra.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name api.grupoaludra.com;

    ssl_certificate /etc/letsencrypt/live/api.grupoaludra.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.grupoaludra.com/privkey.pem;

    root /var/www/ahorro_facil/client/dist;
    index index.html;

    # Backend API Proxy
    location /api {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend Static Files
    location / {
        try_files $uri $uri/ /index.html;
    }
}
`;

    const base64Conf = Buffer.from(nginxConf).toString('base64');

    const cmd = `
    # Cleanup
    rm -f /etc/nginx/sites-enabled/api.grupoaludra.com
    rm -f /etc/nginx/sites-available/api.grupoaludra.com
    
    # Write Config
    echo "${base64Conf}" | base64 -d > /etc/nginx/sites-available/api.grupoaludra.com
    
    # Symlink
    ln -s /etc/nginx/sites-available/api.grupoaludra.com /etc/nginx/sites-enabled/
    
    # Verify and Restart
    echo "--- CONFIG TEST ---"
    nginx -t
    
    echo "--- RESTARTING ---"
    systemctl restart nginx
    
    echo "--- CHECKING PORT 443 ---"
    ss -tulpn | grep :443
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ RESTORE V2 DONE');
        }).on('data', (d) => console.log(d.toString()))
            .stderr.on('data', (d) => console.log('STDERR: ' + d));
    });
}).connect(config);
