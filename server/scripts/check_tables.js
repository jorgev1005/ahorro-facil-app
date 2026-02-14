const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🔍 Connecting to VPS to check DB tables...');

conn.on('ready', () => {
    console.log('✅ Connected. Running table check...');

    // Command to list tables using node script on server (using the existing sequelize config)
    // We'll create a temporary script on the server
    const checkScript = `
    const sequelize = require('./src/config/database');
    sequelize.getQueryInterface().showAllSchemas().then((tableObj) => {
        console.log('SCHEMAS:', tableObj);
    }).catch(err => console.error(err));
    
    // Easier: just SELECT tablename FROM pg_tables WHERE schemaname='public';
    // or use sequelize.showAllTables();
    sequelize.getQueryInterface().showAllTables().then(tables => {
        console.log('TABLES:', tables);
        process.exit(0);
    }).catch(e => { console.error(e); process.exit(1); });
    `;

    // Write script to file
    conn.exec(`echo "${checkScript.replace(/\n/g, ' ')}" > ${REMOTE_DIR}/check_tables.js`, (err, stream) => {
        if (err) throw err;
        stream.on('close', () => {
            // Run it
            conn.exec(`cd ${REMOTE_DIR} && node check_tables.js`, (err, stream) => {
                if (err) throw err;
                stream.on('data', (data) => console.log('STDOUT: ' + data));
                stream.stderr.on('data', (data) => console.log('STDERR: ' + data));
                stream.on('close', () => conn.end());
            });
        });
    });

}).connect(config);
