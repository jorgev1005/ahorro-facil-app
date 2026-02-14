const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🔍 Connecting to VPS to Sync DB...');

conn.on('ready', () => {
    console.log('✅ Connected. Running Sync...');

    // Script to force sync User table
    const syncScript = `
    const sequelize = require('./src/config/database');
    const { User } = require('./src/models');
    
    console.log('Syncing User table...');
    User.sync({ alter: true }).then(() => {
        console.log('✅ User table synced!');
        process.exit(0);
    }).catch(err => {
        console.error('❌ Error syncing:', err);
        process.exit(1);
    });
    `;

    // Upload and run
    conn.exec(`echo "${syncScript.replace(/\n/g, ' ')}" > ${REMOTE_DIR}/sync_users.js`, (err, stream) => {
        if (err) throw err;
        stream.on('close', () => {
            conn.exec(`cd ${REMOTE_DIR} && node sync_users.js`, (err, stream) => {
                if (err) throw err;
                stream.on('data', (data) => console.log('STDOUT: ' + data));
                stream.stderr.on('data', (data) => console.log('STDERR: ' + data));
                stream.on('close', () => {
                    console.log('Done.');
                    conn.end();
                });
            });
        });
    });

}).connect(config);
