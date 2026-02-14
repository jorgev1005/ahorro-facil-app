const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';
const TARGET_EMAIL = 'riveyes@gmail.com';

const conn = new Client();

console.log(`🚀 Connecting to VPS to assign bolso to ${TARGET_EMAIL}...`);

conn.on('ready', () => {
    console.log('✅ Connected.');

    const scriptContent = `
const { Bolso, User } = require('../src/models');
const sequelize = require('../src/config/database');

const run = async () => {
    try {
        await sequelize.authenticate();
        console.log('--- DB ASSIGNMENT START ---');
        
        // 1. Find User
        const user = await User.findOne({ where: { email: '${TARGET_EMAIL}' } });
        
        if (!user) {
            console.log('❌ USER NOT FOUND: ${TARGET_EMAIL}');
            console.log('The user needs to register in the app first!');
            process.exit(0);
        }

        console.log(\`✅ User Found: \${user.name} (\${user.id})\`);

        // 2. Find Unassigned Bolso
        const unassignedBolso = await Bolso.findOne({ where: { userId: null } });

        if (!unassignedBolso) {
            console.log('⚠️ NO UNASSIGNED BOLSO FOUND.');
            console.log('Maybe it is already assigned?');
            process.exit(0);
        }

        console.log(\`✅ Unassigned Bolso Found: \${unassignedBolso.name} (\${unassignedBolso.id})\`);

        // 3. Update
        unassignedBolso.userId = user.id;
        await unassignedBolso.save();

        console.log('🎉 SUCCESS: Bolso assigned to ' + user.name);
        
    } catch (e) { console.error(e); }
    process.exit(0);
};
run();
`;

    const cmd = `
    cd ${REMOTE_DIR}
    cat > scripts/assign_temp.js <<'EOF'
${scriptContent}
EOF
    node scripts/assign_temp.js
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
