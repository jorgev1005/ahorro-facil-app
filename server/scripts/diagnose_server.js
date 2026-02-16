const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const conn = new Client();

console.log('🕵️‍♂️ DIAGNOSING SERVER...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // 1. Create test.html
    // 2. Cat .env
    const cmd = `
    echo "<h1>HELLO WORLD - V1</h1>" > /var/www/ahorro_facil/client/dist/test.html
    
    echo "\n--- CHECKING JWT SECRET in .env ---"
    grep "JWT_SECRET" /var/www/ahorro_facil/server/.env
    
    echo "\n--- CHECKING GENERATE TOKEN LOGIC ---"
    grep -r "jwt.sign" /var/www/ahorro_facil/server/src/routes/
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ DIAGNOSIS DONE');
        }).on('data', (d) => console.log(d.toString()))
            .stderr.on('data', (d) => console.log('STDERR: ' + d));
    });
}).connect(config);
