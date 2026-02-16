const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_TMP = '/tmp/dist.tar.gz';
const REMOTE_DEST = '/var/www/ahorro_facil/dist.tar.gz';
const LOCAL_TAR_PATH = path.join(__dirname, '../../dist.tar.gz');

const conn = new Client();

console.log('🚀 DEPLOY VIA TMP START...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    conn.sftp((err, sftp) => {
        if (err) throw err;
        console.log('📦 Uploading to /tmp...');

        const readStream = fs.createReadStream(LOCAL_TAR_PATH);
        const writeStream = sftp.createWriteStream(REMOTE_TMP);

        writeStream.on('close', () => {
            console.log('✅ Upload to /tmp Done.');

            const cmd = `
            echo "--- MOVING FILE ---"
            mv ${REMOTE_TMP} ${REMOTE_DEST}
            
            echo "--- CLEANING CLIENT DIR ---"
            rm -rf /var/www/ahorro_facil/client
            mkdir -p /var/www/ahorro_facil/client
            
            echo "--- EXTRACTING ---"
            tar -xzf ${REMOTE_DEST} -C /var/www/ahorro_facil/client/
            rm ${REMOTE_DEST}
            
            echo "--- FIXING NGINX ---"
            rm -f /etc/nginx/sites-enabled/ahorro-facil
            rm -f /etc/nginx/sites-enabled/api.grupoaludra.com
            ln -sf /etc/nginx/sites-available/ahorro_facil /etc/nginx/sites-enabled/ahorro_facil
            
            echo "--- RELOADING NGINX ---"
            nginx -t && systemctl reload nginx
            `;

            conn.exec(cmd, (err, stream) => {
                if (err) throw err;
                stream.on('close', (code, signal) => {
                    conn.end();
                    console.log('✅ DEPLOY FINALIZED');
                }).on('data', (d) => console.log(d.toString()))
                    .stderr.on('data', (d) => console.log('STDERR: ' + d));
            });
        });

        readStream.pipe(writeStream);
    });
}).connect(config);
