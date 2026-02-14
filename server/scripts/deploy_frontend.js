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

console.log('🚀 DEPLOYING FRONTEND...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // Read tar file
    try {
        const fileBuffer = fs.readFileSync(LOCAL_TAR_PATH);
        const fileBase64 = fileBuffer.toString('base64');

        console.log(`📦 File ready to upload. Size: ${fileBuffer.length} bytes.`);

        const cmd = `
        cd ${REMOTE_DIR}
        
        echo "--- UPLOADING dist.tar.gz ---"
        echo "${fileBase64}" | base64 -d > client/dist.tar.gz
        
        echo "--- EXTRACTING ---"
        # Remove old dist content first to be clean? No, tar overwrite is fine.
        # But maybe good practice to clean.
        rm -rf client/dist/*
        tar -xzf client/dist.tar.gz -C client/
        
        echo "--- CLEANUP ---"
        rm client/dist.tar.gz
        
        echo "--- LISTING NEW DIST ---"
        ls -l client/dist/
        `;

        conn.exec(cmd, (err, stream) => {
            if (err) throw err;
            stream.on('close', (code, signal) => {
                conn.end();
                console.log('✅ DEPLOY DONE');
            }).on('data', (data) => console.log(data.toString()))
                .stderr.on('data', (data) => console.log('STDERR: ' + data));
        });

    } catch (err) {
        console.error('❌ Error reading file:', err);
        conn.end();
    }
}).connect(config);
