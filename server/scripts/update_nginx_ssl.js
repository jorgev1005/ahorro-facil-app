const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const conn = new Client();

console.log('🚀 UPDATING SSL CONFIG...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // Nginx Config with SSL, handling both domains, serving static files and API
    const nginxConfig = `
server {
    server_name api.grupoaludra.com ahorro.grupoaludra.com www.ahorro.grupoaludra.com;

    # Frontend Static Files
    root /var/www/ahorro_facil/client/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy
    location /api {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/api.grupoaludra.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.grupoaludra.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    if ($host = api.grupoaludra.com) {
        return 301 https://$host$request_uri;
    }
    if ($host = ahorro.grupoaludra.com) {
        return 301 https://$host$request_uri;
    }
    if ($host = www.ahorro.grupoaludra.com) {
        return 301 https://$host$request_uri;
    }

    listen 80;
    server_name api.grupoaludra.com ahorro.grupoaludra.com www.ahorro.grupoaludra.com;
    return 404;
}
`;

    const nginxBase64 = Buffer.from(nginxConfig).toString('base64');

    const cmd = `
    echo "--- WRITING CONFIG ---"
    echo "${nginxBase64}" | base64 -d > /etc/nginx/sites-available/api.grupoaludra.com
    
    echo "--- ENABLING SITE ---"
    ln -sf /etc/nginx/sites-available/api.grupoaludra.com /etc/nginx/sites-enabled/api.grupoaludra.com
    
    echo "--- REMOVING CONFLICTS ---"
    rm -f /etc/nginx/sites-enabled/ahorro_facil
    rm -f /etc/nginx/sites-enabled/ahorro-facil
    
    echo "--- RELOADING NGINX ---"
    nginx -t && systemctl reload nginx
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ NGINX SSL UPDATE DONE');
        }).on('data', (d) => console.log(d.toString()))
            .stderr.on('data', (d) => console.log('STDERR: ' + d));
    });
}).connect(config);
