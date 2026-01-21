const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

// CAUTION: Modifying config files. 
// We append the HBA rule.
// We use sed to uncomment and change listen_addresses.

const commands = [
    // 1. Modify listen_addresses to '*'
    // Finds #listen_addresses = 'localhost' OR listen_addresses = 'localhost' and replaces with listen_addresses = '*'
    `sudo sed -i "s/^#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/*/main/postgresql.conf`,
    `sudo sed -i "s/^listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/*/main/postgresql.conf`,

    // 2. Add HBA rule for this specific user/db from any IP (simplifies dev)
    // Check if it already exists to avoid duplicates? Simple echo append is risky if run multiple times.
    // Grep first.
    `grep -q "ahorro_user" /etc/postgresql/*/main/pg_hba.conf || echo "host ahorro_facil ahorro_user 0.0.0.0/0 scram-sha-256" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf`,

    // 3. Restart Postgres
    `sudo systemctl restart postgresql`,

    // 4. Verify config
    `grep "listen_addresses" /etc/postgresql/*/main/postgresql.conf`,
    `tail -n 2 /etc/postgresql/*/main/pg_hba.conf`
];

const conn = new Client();

conn.on('ready', () => {
    console.log('Client :: ready');
    const script = commands.join(' && ');

    conn.exec(script, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            console.log('Stream :: close :: code: ' + code);
            conn.end();
        }).on('data', (data) => console.log('STDOUT: ' + data))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
