const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const conn = new Client();

console.log('🕵️‍♂️ CHECKING DB SCHEMA...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // We need to run a script on the remote server that connects to the SQLite DB and checks columns.
    // Or we can just use the `sqlite3` CLI if installed.
    // Safer to use a node script since we know node is there.

    const inspectorScript = `
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
});

async function check() {
    try {
        const [results] = await sequelize.query("PRAGMA table_info(Payments);");
        console.log('--- COLUMNS IN Payments TABLE ---');
        results.forEach(c => console.log(c.name + ' (' + c.type + ')'));
    } catch (e) {
        console.error(e);
    }
}
check();
`;

    const base64Script = Buffer.from(inspectorScript).toString('base64');

    const cmd = `
    cd /var/www/ahorro_facil
    echo "${base64Script}" | base64 -d > scripts/inspect_schema.js
    node scripts/inspect_schema.js
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ SCHEMA CHECK DONE');
        }).on('data', (d) => console.log(d.toString()))
            .stderr.on('data', (d) => console.log('STDERR: ' + d));
    });
}).connect(config);
