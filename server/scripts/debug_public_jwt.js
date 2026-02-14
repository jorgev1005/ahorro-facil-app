const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🔍 DEBUGGING JWT ON VPS...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    const scriptContent = `
require('dotenv').config();
const jwt = require('jsonwebtoken');

console.log('--- JWT DEBUG REPORT ---');

// 1. Check Secret
const secret = process.env.JWT_SECRET;
if (!secret) {
    console.error('❌ JWT_SECRET is MISSING in process.env');
} else {
    console.log('✅ JWT_SECRET found. Length:', secret.length);
    console.log('   First 3 chars:', secret.substring(0, 3));
}

// 2. Test Sign/Verify
try {
    const payload = { test: 'data' };
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });
    console.log('✅ Token Generated successfully.');
    
    const decoded = jwt.verify(token, secret);
    console.log('✅ Token Verified successfully. Payload:', decoded);
} catch (err) {
    console.error('❌ JWT Sign/Verify Failed:', err.message);
}
`;

    const cmd = `
    cd ${REMOTE_DIR}
    cat > scripts/debug_jwt_test.js <<'EOF'
${scriptContent}
EOF
    node scripts/debug_jwt_test.js
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
