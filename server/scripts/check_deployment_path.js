const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const conn = new Client();

console.log('🕵️‍♂️ CHECKING DEPLOYMENT PATH...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // 1. List sites-enabled
    // 2. Cat all of them to find the one with the domain
    const cmd = `
    echo "--- SITES ENABLED ---"
    ls -la /etc/nginx/sites-enabled/
    
    echo "\n--- FINDING CONFIG FOR api.grupoaludra.com ---"
    grep -r "server_name.*api.grupoaludra.com" /etc/nginx/sites-enabled/
    
    echo "\n--- READING CONTENT OF MATCHING FILE ---"
    # Assuming the grep output helps, let's just cat the likely candidate if we found one previousy or just cat all
    cat /etc/nginx/sites-enabled/*
    
    echo "\n--- GREP FOR DEBUG INFO IN DIST ASSETS ---"
    grep -r "DEBUG INFO" /var/www/ahorro_facil/client/dist/assets/
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
