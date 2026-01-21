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
const ARCHIVE_NAME = 'server_pkg.tar.gz';

const conn = new Client();

console.log('🚀 Starting Deployment...');

conn.on('ready', () => {
    console.log('✅ SSH Connected');

    conn.sftp((err, sftp) => {
        if (err) throw err;

        const localPath = path.join(__dirname, '..', ARCHIVE_NAME);
        const remotePath = `/tmp/${ARCHIVE_NAME}`;

        console.log('📦 Uploading package...');

        sftp.fastPut(localPath, remotePath, (err) => {
            if (err) throw err;
            console.log('✅ Upload successful');

            // Commands to execute on server
            const commands = [
                // Prepare directory
                `mkdir -p ${REMOTE_DIR}`,

                // Extract
                `tar -xzf ${remotePath} -C ${REMOTE_DIR}`,

                // Cleanup archive
                `rm ${remotePath}`,

                // Setup permissions
                // `chown -R root:root ${REMOTE_DIR}`,

                // Install Deps
                `cd ${REMOTE_DIR} && npm install --production`,

                // Setup Prod Env (Creating file directly)
                `echo "PORT=3000" > ${REMOTE_DIR}/.env`,
                `echo "DATABASE_URL=postgres://ahorro_user:Ahorro2026Secure!@localhost:5432/ahorro_facil" >> ${REMOTE_DIR}/.env`,
                `echo "NODE_ENV=production" >> ${REMOTE_DIR}/.env`,

                // PM2 Setup
                // Check if pm2 is installed, if not install it
                `npm list -g pm2 || npm install -g pm2`,

                // Start/Restart
                `cd ${REMOTE_DIR} && pm2 start ecosystem.config.js --env production || pm2 restart ahorro-facil-api`,
                `pm2 save`,

                // List status
                `pm2 status`
            ];

            const script = commands.join(' && ');

            console.log('⚙️  Executing remote setup...');
            conn.exec(script, (err, stream) => {
                if (err) throw err;
                stream.on('close', (code, signal) => {
                    console.log('🏁 Remote process finished. Code: ' + code);
                    conn.end();
                }).on('data', (data) => console.log('REMOTE STDOUT: ' + data))
                    .stderr.on('data', (data) => console.log('REMOTE STDERR: ' + data));
            });
        });
    });
}).connect(config);
