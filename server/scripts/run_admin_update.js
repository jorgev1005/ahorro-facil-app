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

console.log('🔍 Connecting to VPS for ADMIN UPDATE...');

conn.on('error', (err) => console.error('❌ SSH Error:', err));

conn.on('ready', () => {
    console.log('✅ Connected.');

    // 1. Unassign Script
    const unassignScript = `
const { Bolso, User } = require('../src/models');
const sequelize = require('../src/config/database');

const run = async () => {
    try {
        await sequelize.authenticate();
        const user = await User.findOne({ where: { email: '${USER_EMAIL}' } });
        if (!user) { console.log('User not found'); process.exit(1); }
        
        const [updated] = await Bolso.update({ userId: null }, { where: { userId: user.id } });
        console.log(\`✅ Unassigned \${updated} bolsos from \${user.email}\`);
    } catch (e) { console.error(e); }
    process.exit(0);
};
run();
`;

    // 2. Make Admin Script
    const makeAdminScript = `
const { User } = require('../src/models');
const sequelize = require('../src/config/database');

const run = async () => {
    try {
        await sequelize.authenticate();
        const user = await User.findOne({ where: { email: '${USER_EMAIL}' } });
        if (!user) { console.log('User not found'); process.exit(1); }
        
        user.isAdmin = true;
        await user.save();
        console.log(\`✅ User \${user.email} is now ADMIN.\`);
    } catch (e) { console.error(e); }
    process.exit(0);
};
run();
`;

    const cmd = `
    cd ${REMOTE_DIR}
    
    echo "--- DEPLOYING SCRIPTS ---"
    cat > scripts/unassign_temp.js <<'EOF'
${unassignScript}
EOF

    cat > scripts/make_admin_temp.js <<'EOF'
${makeAdminScript}
EOF

    echo "--- EXECUTING OPS ---"
    node scripts/unassign_temp.js
    node scripts/make_admin_temp.js
    
    echo "--- UPDATING BACKEND CODE ---"
    git pull origin main
    pm2 restart all
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            if (code === 0) console.log('✅ ADMIN UPDATE COMPLETED SUCCESSFULLY');
            else console.error('❌ Update failed with code', code);
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
