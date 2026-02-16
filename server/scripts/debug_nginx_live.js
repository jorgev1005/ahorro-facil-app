const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const conn = new Client();

console.log('🕵️‍♂️ DUMPING NGINX CONFIG & PATCHING INDEX...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    const cmd = `
    echo "--- CHECKING INDEX.HTML CONTENT ---"
    grep "V5-DEBUG-ACTIVE" /var/www/ahorro_facil/client/dist/index.html
    
    echo "--- DUMPING NGINX CONFIG TO FILE ---"
    nginx -T > /tmp/nginx_full_dump.txt
    
    echo "--- FINDING SERVER BLOCK FOR api.grupoaludra.com ---"
    # Find the line number of the server_name, then print surrounding lines
    grep -n "server_name api.grupoaludra.com" /tmp/nginx_full_dump.txt | while read -r line; do
        lnum=$(echo $line | cut -d: -f1)
        echo "Found at line $lnum:"
        sed -n "$((lnum-10)),$((lnum+20))p" /tmp/nginx_full_dump.txt
    done
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ DUMP DONE');
        }).on('data', (d) => console.log(d.toString()))
            .stderr.on('data', (d) => console.log('STDERR: ' + d));
    });
}).connect(config);
