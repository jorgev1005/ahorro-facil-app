const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';
const USER_EMAIL = 'jorge.verenzuela@gmail.com';

const conn = new Client();

console.log('🔍 Connecting to VPS for DEBUG...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    const debugScript = `
const { Bolso, User } = require('../src/models');
const sequelize = require('../src/config/database');

const run = async () => {
    try {
        await sequelize.authenticate();
        console.log('--- DB STATUS REPORT ---');
        
        const user = await User.findOne({ where: { email: '${USER_EMAIL}' } });
        if (!user) { 
            console.log('❌ User not found'); 
        } else {
            console.log(\`User: \${user.name}\`);
            console.log(\`Email: \${user.email}\`);
            console.log(\`ID: \${user.id}\`);
            console.log(\`isAdmin: \${user.isAdmin}\`);
            
            const myBolsos = await Bolso.count({ where: { userId: user.id } });
            console.log(\`My Bolsos Count (should be 0): \${myBolsos}\`);
        }

        const totalBolsos = await Bolso.count();
        console.log(\`Total Bolsos in DB: \${totalBolsos}\`);
        
        const unassignedBolsos = await Bolso.count({ where: { userId: null } });
        console.log(\`Unassigned Bolsos: \${unassignedBolsos}\`);
        
    } catch (e) { console.error(e); }
    process.exit(0);
};
run();
`;

    const cmd = `
    cd ${REMOTE_DIR}
    cat > scripts/debug_temp.js <<'EOF'
${debugScript}
EOF
    node scripts/debug_temp.js
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
