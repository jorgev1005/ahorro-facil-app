const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🚀 ASSIGNING BOLSOS...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    const scriptContent = `
const { User, Bolso } = require('../src/models');
const sequelize = require('../src/config/database');

async function assign() {
    try {
        await sequelize.authenticate();
        console.log('✅ DB Connected');
        
        const email = 'jorge.verenzuela@gmail.com';
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            console.error('❌ User not found:', email);
            return;
        }
        
        console.log('👤 User Found:', user.name, user.id);
        
        const bolsos = await Bolso.findAll();
        console.log('📦 Bolsos Found:', bolsos.length);
        
        for (const bolso of bolsos) {
            console.log(\`   - Updating Bolso "\${bolso.name}" (ID: \${bolso.id}) to User \${user.id}\`);
            bolso.userId = user.id;
            await bolso.save();
        }
        
        console.log('✅ UPDATE COMPLETE');
        
    } catch (error) {
        console.error('🔥 Error:', error);
    } finally {
        await sequelize.close();
    }
}

assign();
`;

    const base64Content = Buffer.from(scriptContent).toString('base64');

    const cmd = `
    cd ${REMOTE_DIR}
    
    echo "--- WRITING SCRIPT ---"
    echo "${base64Content}" | base64 -d > scripts/assign_bolsos_fix.js
    
    echo "--- EXECUTING ---"
    node scripts/assign_bolsos_fix.js
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ ASSIGNMENT TASK DONE');
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
