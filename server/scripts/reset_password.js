const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🚀 RESETTING PASSWORD...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    const scriptContent = `
const { User } = require('../src/models');
const sequelize = require('../src/config/database');
const bcrypt = require('bcryptjs');

async function reset() {
    try {
        await sequelize.authenticate();
        console.log('✅ DB Connected');
        
        const email = 'riveyes@gmail.com';
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            console.error('❌ User not found:', email);
            return;
        }
        
        const salt = await bcrypt.genSalt(10);
        const limitPassword = await bcrypt.hash('123456', salt);
        
        user.password = limitPassword;
        await user.save();
        
        console.log('✅ PASSWORD RESET SUCCESSFUL for', email);
        console.log('   New Password: "123456"');
        
    } catch (error) {
        console.error('🔥 Error:', error);
    } finally {
        await sequelize.close();
    }
}

reset();
`;

    const base64Content = Buffer.from(scriptContent).toString('base64');

    const cmd = `
    cd ${REMOTE_DIR}
    echo "${base64Content}" | base64 -d > scripts/reset_password.js
    node scripts/reset_password.js
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ RESET TASK DONE');
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
