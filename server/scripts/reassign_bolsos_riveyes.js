const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🚀 RE-ASSIGNING BOLSOS TO RIVEYES...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    const scriptContent = `
const { User, Bolso } = require('../src/models');
const sequelize = require('../src/config/database');

async function reassign() {
    try {
        await sequelize.authenticate();
        console.log('✅ DB Connected');
        
        const targetEmail = 'riveyes@gmail.com';
        const targetUser = await User.findOne({ where: { email: targetEmail } });
        
        if (!targetUser) {
            console.error('❌ User not found:', targetEmail);
            console.log('⚠️ Please register this user first via the app.');
            return;
        }
        
        console.log('👤 Target User Found:', targetUser.name, targetUser.id);
        
        // Find ALL bolsos (simplest fix based on user request "los datos")
        // Or find specifically those assigned to Jorge? 
        // User implied "all data" belongs to Riveyes.
        const bolsos = await Bolso.findAll();
        
        console.log('📦 Processing \${bolsos.length} Bolsos...');
        
        for (const bolso of bolsos) {
            console.log(\`   - Transferring "\${bolso.name}" from \${bolso.userId} -> \${targetUser.id}\`);
            bolso.userId = targetUser.id;
            await bolso.save();
        }
        
        console.log('✅ RE-ASSIGNMENT COMPLETE');
        
    } catch (error) {
        console.error('🔥 Error:', error);
    } finally {
        await sequelize.close();
    }
}

reassign();
`;

    const base64Content = Buffer.from(scriptContent).toString('base64');

    const cmd = `
    cd ${REMOTE_DIR}
    
    echo "--- WRITING SCRIPT ---"
    echo "${base64Content}" | base64 -d > scripts/reassign_riveyes.js
    
    echo "--- EXECUTING ---"
    node scripts/reassign_riveyes.js
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ TASK DONE');
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
