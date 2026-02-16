const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const conn = new Client();

console.log('🕵️‍♂️ CHECKING DEPLOYMENT PATH (V2)...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    const cmd = `
    echo "--- SITES ENABLED ---"
    ls -F /etc/nginx/sites-enabled/
    
    echo "\n--- DEFAULT SITE CONFIG (Head) ---"
    head -n 20 /etc/nginx/sites-enabled/default
    
    echo "\n--- AHORRO API SITE CONFIG (Head) ---"
    head -n 20 /etc/nginx/sites-enabled/ahorro_api 2>/dev/null
    
    echo "\n--- CHECKING FOR NEW CODE (COUNT) ---"
    grep -c "DEBUG INFO" /var/www/ahorro_facil/client/dist/assets/*.js
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('\n✅ CHECK COMPLETE');
        }).on('data', (d) => console.log(d.toString()))
            .stderr.on('data', (d) => console.log('STDERR: ' + d));
    });
}).connect(config);
