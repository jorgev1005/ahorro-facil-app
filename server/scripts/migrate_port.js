const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🚀 MIGRATING TO PORT 3002...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // 1. Overwrite index.js to force port 3002 (or read from env but force it here for certainty)
    const indexJsContent = `
const app = require('./app');
const sequelize = require('./config/database');
const PORT = 3002; // FORCE 3002

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected.');
        await sequelize.sync({ alter: true });
        console.log('✅ Database synced.');
        
        app.listen(PORT, () => {
            console.log(\`🚀 Server running on port \${PORT}\`);
        });
    } catch (error) {
        console.error('❌ Startup Error:', error);
    }
}

startServer();
`;

    const indexBase64 = Buffer.from(indexJsContent).toString('base64');

    const cmd = `
    cd ${REMOTE_DIR}
    echo "--- UPDATING index.js ---"
    echo "${indexBase64}" | base64 -d > src/index.js
    
    echo "--- STOPPING OLD PM2 ---"
    pm2 delete all
    
    echo "--- STARTING ON 3002 ---"
    // Use --update-env just in case, but code forces 3002
    pm2 start src/index.js --name ahorro-api-3002
    pm2 save
    
    echo "--- WAITING FOR STARTUP ---"
    sleep 5
    
    echo "--- CURLING 3002 ---"
    curl -v http://localhost:3002/api/public/ping
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ MIGRATION DONE');
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
