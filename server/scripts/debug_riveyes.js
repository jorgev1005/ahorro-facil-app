const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🔍 DEBUGGING RIVEYES DATA...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    const scriptContent = `
const { User, Bolso } = require('../src/models');
const sequelize = require('../src/config/database');

async function debug() {
    try {
        await sequelize.authenticate();
        console.log('✅ DB Connected');
        
        const email = 'riveyes@gmail.com';
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            console.error('❌ User riveyes@gmail.com NOT FOUND');
        } else {
            console.log('👤 User Found:', user.name);
            console.log('   ID:', user.id);
            console.log('   Email:', user.email);
        }
        
        console.log('--- ALL BOLSOS ---');
        const bolsos = await Bolso.findAll();
        for (const b of bolsos) {
            console.log(\`📦 Bolso: "\${b.name}"\`);
            console.log(\`   ID: \${b.id}\`);
            console.log(\`   Assigned UserID: \${b.userId}\`);
            
            if (user && b.userId === user.id) {
                console.log('   ✅ MATCHES RIVEYES');
            } else {
                console.log('   ❌ DOES NOT MATCH');
            }
        }
        
    } catch (error) {
        console.error('🔥 Error:', error);
    } finally {
        await sequelize.close();
    }
}

debug();
`;

    const base64Content = Buffer.from(scriptContent).toString('base64');

    const cmd = `
    cd ${REMOTE_DIR}
    echo "${base64Content}" | base64 -d > scripts/debug_riveyes_v2.js
    node scripts/debug_riveyes_v2.js
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ DEBUG DONE');
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
