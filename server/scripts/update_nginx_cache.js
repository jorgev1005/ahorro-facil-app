const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🚀 UPDATING NGINX CACHE SETTINGS...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // We overwrite the config to ensure index.html is never cached
    const nginxConfig = `
server {
    server_name api.grupoaludra.com;

    location / {
        root /var/www/ahorro_facil/client/dist;
        index index.html;
        try_files $uri $uri/ /index.html;

        # Disable caching for index.html to ensure updates are seen immediately
        location = /index.html {
            add_header Cache-Control "no-store, no-cache, must-revalidate";
        }
    }

    location /api {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/api.grupoaludra.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/api.grupoaludra.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = api.grupoaludra.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    server_name api.grupoaludra.com;
    listen 80;
    return 404; # managed by Certbot
}
`;

    const base64Content = Buffer.from(nginxConfig).toString('base64');

    const cmd = `
    echo "${base64Content}" | base64 -d > /etc/nginx/sites-available/ahorro_facil
    ln -sf /etc/nginx/sites-available/ahorro_facil /etc/nginx/sites-enabled/ahorro_facil
    nginx -t && systemctl reload nginx
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ NGINX UPDATE DONE');
        }).on('data', (d) => console.log(d.toString()))
            .stderr.on('data', (d) => console.log('STDERR: ' + d));
    });
}).connect(config);
