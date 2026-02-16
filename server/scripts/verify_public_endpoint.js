const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const conn = new Client();

console.log('🕵️‍♂️ VERIFYING PUBLIC API RESPONSE...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // Curl localhost to check response body
    // We expect a JSON with "debug" field
    const cmd = `curl -s -X GET http://localhost:3002/api/public/participant/INVALID_TOKEN_TEST`;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('\n✅ VERIFICATION COMPLETE');
        }).on('data', (d) => console.log(d.toString()))
            .stderr.on('data', (d) => console.log('STDERR: ' + d));
    });
}).connect(config);
