const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🔍 DEBUG ARCHIVED STATUS...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // Check archived status
    const scriptContent = `
const { Bolso } = require('../src/models');
const sequelize = require('../src/config/database');

async function check() {
    try {
        await sequelize.authenticate();
        const bolsos = await Bolso.findAll();
        for (const b of bolsos) {
            console.log(\`📦 Bolso: "\${b.name}" | Archived: \${b.archived}\`);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}
check();
`;

    const base64Content = Buffer.from(scriptContent).toString('base64');

    const cmd = `
    cd ${REMOTE_DIR}
    echo "${base64Content}" | base64 -d > scripts/debug_archived.js
    node scripts/debug_archived.js
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ CHECK DONE');
        }).on('data', (d) => console.log(d.toString()))
            .stderr.on('data', (d) => console.log('STDERR: ' + d));
    });
}).connect(config);
