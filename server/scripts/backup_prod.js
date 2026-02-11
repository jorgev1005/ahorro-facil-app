const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root', // Using root to ensure we can read/write to tmp and execute everything
    password: 'xz18219jl'
};

const DB_USER = 'ahorro_user';
const DB_PASS = 'Ahorro2026Secure!';
const DB_NAME = 'ahorro_facil';

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const BACKUP_FILENAME = `backup_prod_${timestamp}.sql`;
const REMOTE_PATH = `/tmp/${BACKUP_FILENAME}`;
const LOCAL_DIR = path.join(__dirname, '..', 'backups');
const LOCAL_PATH = path.join(LOCAL_DIR, BACKUP_FILENAME);

// Ensure local backups dir exists
if (!fs.existsSync(LOCAL_DIR)) {
    fs.mkdirSync(LOCAL_DIR);
}

const conn = new Client();

console.log('🚀 Starting Database Backup...');
console.log(`📡 Connecting to ${config.host}...`);

conn.on('ready', () => {
    console.log('✅ SSH Connected');

    // Command to dump DB
    // PGPASSWORD is used to pass password to pg_dump to avoid prompt
    const dumpCommand = `PGPASSWORD='${DB_PASS}' pg_dump -U ${DB_USER} -h localhost ${DB_NAME} > ${REMOTE_PATH}`;

    console.log('💾 Executing pg_dump on remote server...');

    conn.exec(dumpCommand, (err, stream) => {
        if (err) throw err;

        stream.on('close', (code, signal) => {
            if (code !== 0) {
                console.error(`❌ pg_dump failed with code ${code}`);
                conn.end();
                return;
            }
            console.log('✅ Remote dump successful.');

            // Now download the file
            conn.sftp((err, sftp) => {
                if (err) throw err;

                console.log(`⬇️ Downloading to ${LOCAL_PATH}...`);

                sftp.fastGet(REMOTE_PATH, LOCAL_PATH, (err) => {
                    if (err) throw err;
                    console.log('✅ Download successful!');

                    // Cleanup remote
                    conn.exec(`rm ${REMOTE_PATH}`, (err, stream) => {
                        console.log('🧹 Remote cleanup done.');
                        conn.end();
                        console.log(`\n🎉 BACKUP COMPLETE: ${LOCAL_PATH}`);
                    });
                });
            });
        }).on('data', (data) => {
            console.log('STDOUT: ' + data);
        }).stderr.on('data', (data) => {
            console.log('STDERR: ' + data);
        });
    });
}).connect(config);
