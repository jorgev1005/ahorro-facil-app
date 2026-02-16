const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const conn = new Client();

console.log('🕵️‍♂️ EXPLORING ROOT DIR...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    const cmd = `
    echo "--- LS /var/www/ahorro_facil ---"
    ls -F /var/www/ahorro_facil/
    
    echo "\n--- CHECKING .ENV ---"
    cat /var/www/ahorro_facil/.env || echo ".env not found in root"
    
    echo "\n--- CHECKING SERVER/SRC ---"
    ls -F /var/www/ahorro_facil/server/ 2>/dev/null || echo "server dir not found"
    
    echo "\n--- CHECKING SRC ---"
    ls -F /var/www/ahorro_facil/src/ 2>/dev/null || echo "src dir not found"
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ EXPLORE DONE');
        }).on('data', (d) => console.log(d.toString()))
            .stderr.on('data', (d) => console.log('STDERR: ' + d));
    });
}).connect(config);
