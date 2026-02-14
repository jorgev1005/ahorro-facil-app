const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_TAR_PATH = '/var/www/ahorro_facil/dist.tar.gz';
const LOCAL_TAR_PATH = path.join(__dirname, '../../dist.tar.gz');

const conn = new Client();

console.log('🚀 DEPLOYING FRONTEND VIA SFTP...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    conn.sftp((err, sftp) => {
        if (err) {
            console.error('❌ SFTP Error:', err);
            conn.end();
            return;
        }

        console.log('📦 Starting Upload...');
        const readStream = fs.createReadStream(LOCAL_TAR_PATH);
        const writeStream = sftp.createWriteStream(REMOTE_TAR_PATH);

        writeStream.on('close', () => {
            console.log('✅ Upload Complete.');
            // Run extraction
            conn.exec(`
                echo "--- EXTRACTING ---"
                tar -xzf ${REMOTE_TAR_PATH} -C /var/www/ahorro_facil/client/
                rm ${REMOTE_TAR_PATH}
                echo "--- DONE ---"
            `, (err, stream) => {
                if (err) throw err;
                stream.on('close', (code, signal) => {
                    conn.end();
                    console.log('✅ EXTRACTION DOONE');
                }).on('data', (data) => console.log(data.toString()))
                    .stderr.on('data', (data) => console.log('STDERR: ' + data));
            });
        });

        readStream.pipe(writeStream);
    });
}).connect(config);
