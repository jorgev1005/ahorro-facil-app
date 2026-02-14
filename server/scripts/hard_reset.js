const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🚀 PERFORMING HARD RESET...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    const cmd = `
    cd ${REMOTE_DIR}
    
    echo "--- STOPPING PM2 ---"
    pm2 delete all
    
    echo "--- VERIFYING APP.JS AGAIN ---"
    grep "paymentRoutes" src/app.js
    
    echo "--- STARTING FRESH ---"
    pm2 start src/index.js --name ahorro-facil-api --update-env
    pm2 save
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ HARD RESET DONE');
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
