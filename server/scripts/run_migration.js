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

console.log('🔍 Connecting to VPS for Data Migration...');

conn.on('error', (err) => {
    console.error('❌ SSH Connection Error:', err);
});

conn.on('ready', () => {
    console.log('✅ Connected.');

    // The migration script content
    const migrationScript = `
const { Bolso, User } = require('../src/models');
const sequelize = require('../src/config/database');

const migrate = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to DB');
        
        const email = '${USER_EMAIL}';
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            console.error('❌ User not found:', email);
            process.exit(1);
        }
        
        console.log(\`Found User: \${user.name} (ID: \${user.id})\`);
        
        // Count before
        const countBefore = await Bolso.count({ where: { userId: null } });
        console.log(\`Found \${countBefore} unassigned bolsos.\`);
        
        if (countBefore === 0) {
            console.log('⚠️ No unassigned data found. Maybe already migrated?');
             // Check if user has bolsos
            const userCount = await Bolso.count({ where: { userId: user.id } });
            console.log(\`User already has \${userCount} bolsos.\`);
            process.exit(0);
        }

        // Update
        const [updated] = await Bolso.update(
            { userId: user.id },
            { where: { userId: null } }
        );
        
        console.log(\`✅ SUCCESS: Migrated \${updated} bolsos to user \${user.email}\`);
        process.exit(0);

    } catch (error) {
        console.error('❌ Migration Failed:', error);
        process.exit(1);
    }
};

migrate();
`;

    const cmd = `
    echo "--- WRITING MIGRATION SCRIPT ---"
    cat > ${REMOTE_DIR}/scripts/migrate_temp.js <<'EOF'
${migrationScript}
EOF

    echo "--- EXECUTING MIGRATION ---"
    cd ${REMOTE_DIR}
    node scripts/migrate_temp.js
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
