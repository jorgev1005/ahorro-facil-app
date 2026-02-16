const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const conn = new Client();

console.log('🕵️‍♂️ CHECKING PAYMENT ERROR LOGS...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // Check logs for errors related to /api/payments or Sequelize
    const cmd = `
    pm2 logs --nostream --lines 50 | grep -C 5 "POST /api/payments"
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ LOG CHECK DONE');
        }).on('data', (d) => console.log(d.toString()))
            .stderr.on('data', (d) => console.log('STDERR: ' + d));
    });
}).connect(config);
