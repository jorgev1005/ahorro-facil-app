const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🔍 DEBUG EXACT QUERY...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    const scriptContent = `
const { Bolso, Participant, Payment, User } = require('../src/models');
const sequelize = require('../src/config/database');

async function debug() {
    try {
        await sequelize.authenticate();
        console.log('✅ DB Connected');
        
        const userId = '6451ca4a-0202-47fc-a9cd-8a02e70e62fe'; // Riveyes ID from logs
        
        const query = {
            order: [['createdAt', 'DESC']],
            include: [
                { model: Participant },
                { model: Payment }
            ],
            where: { userId: userId },
            logging: console.log // PRINT SQL
        };

        console.log('--- EXECUTING QUERY ---');
        const bolsos = await Bolso.findAll(query);
        console.log(\`Found \${bolsos.length} bolsos.\`); 
        
    } catch (error) {
        console.error('🔥 Error:', error);
    } finally {
        await sequelize.close();
    }
}

debug();
`;

    const base64Content = Buffer.from(scriptContent).toString('base64');

    const cmd = `
    cd ${REMOTE_DIR}
    echo "${base64Content}" | base64 -d > scripts/debug_query_exact.js
    node scripts/debug_query_exact.js
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ DEBUG DONE');
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
