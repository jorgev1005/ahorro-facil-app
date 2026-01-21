const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const commands = [
    // Check if postgres is running
    'systemctl status postgresql | grep Active',
    // Create User if not exists (using safe approach with DO block logic usually requires SQL, but shell is easier)
    // We will try to create and ignore error if exists
    `sudo -u postgres psql -c "CREATE USER ahorro_user WITH PASSWORD 'Ahorro2026Secure!';"` +
    ` || echo "User creation failed (might exist)"`,

    // Create DB
    `sudo -u postgres psql -c "CREATE DATABASE ahorro_facil OWNER ahorro_user;"` +
    ` || echo "DB creation failed (might exist)"`,

    // Check Listen Addresses
    `grep "listen_addresses" /etc/postgresql/*/main/postgresql.conf`,
    // Check pg_hba (peek at the end)
    `tail -n 5 /etc/postgresql/*/main/pg_hba.conf`
];

const conn = new Client();

conn.on('ready', () => {
    console.log('Client :: ready');

    // Chaining commands via a single shell session might be cleaner, 
    // but let's run them sequentially for clear output.
    // Actually, exec runs isolated. Let's run a combined script.

    const script = commands.join(' && echo "---" && ');

    conn.exec(script, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
            conn.end();
        }).on('data', (data) => {
            console.log('STDOUT: ' + data);
        }).stderr.on('data', (data) => {
            console.log('STDERR: ' + data);
        });
    });
}).connect(config);
