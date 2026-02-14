const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';
const LOCAL_TAR_PATH = path.join(__dirname, '../../dist.tar.gz');

const conn = new Client();

console.log('🚀 SEQUENTIAL DEPLOY START...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // Step 1: Mkdir
    conn.exec(`mkdir -p ${REMOTE_DIR}/client`, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            console.log('✅ Mkdir Done.');

            // Step 2: SFTP
            conn.sftp((err, sftp) => {
                if (err) throw err;
                console.log('📦 Starting Upload...');

                const readStream = fs.createReadStream(LOCAL_TAR_PATH);
                const writeStream = sftp.createWriteStream(`${REMOTE_DIR}/dist.tar.gz`);

                writeStream.on('close', () => {
                    console.log('✅ Upload Done.');

                    // Step 3: Extract & Fix Nginx
                    const cmd = `
                    echo "--- EXTRACTING ---"
                    tar -xzf ${REMOTE_DIR}/dist.tar.gz -C ${REMOTE_DIR}/client/
                    
                    echo "--- FIXING NGINX ---"
                    rm -f /etc/nginx/sites-enabled/ahorro-facil
                    rm -f /etc/nginx/sites-enabled/api.grupoaludra.com
                    ln -sf /etc/nginx/sites-available/ahorro_facil /etc/nginx/sites-enabled/ahorro_facil
                    
                    echo "--- RELOADING NGINX ---"
                    nginx -t
                    systemctl reload nginx
                    `;

                    conn.exec(cmd, (err, stream) => {
                        if (err) throw err;
                        stream.on('close', (code, signal) => {
                            conn.end();
                            console.log('✅ ALL DONE');
                        }).on('data', (d) => console.log(d.toString()))
                            .stderr.on('data', (d) => console.log('STDERR: ' + d));
                    });
                });

                readStream.pipe(writeStream);
            });
        });
    });
}).connect(config);
