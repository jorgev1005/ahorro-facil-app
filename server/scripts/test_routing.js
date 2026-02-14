const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🔍 TEST ROUTING SCRIPT...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    const scriptContent = `
const app = require('../src/app');
const http = require('http');

console.log('--- TESTING APP ROUTING ---');

const server = http.createServer(app);
server.listen(3333, () => {
    console.log('Test Server listening on 3333');
    
    const req = http.get('http://localhost:3333/api/public/ping', (res) => {
        console.log('STATUS:', res.statusCode);
        console.log('HEADERS:', JSON.stringify(res.headers));
        
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log('BODY:', data);
            server.close();
            process.exit(0);
        });
    });
    
    req.on('error', (e) => {
        console.error('REQUEST ERROR:', e);
        server.close();
        process.exit(1);
    });
});
`;

    const cmd = `
    cd ${REMOTE_DIR}
    cat > scripts/test_routing.js <<'EOF'
${scriptContent}
EOF
    node scripts/test_routing.js
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ TEST DONE');
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
