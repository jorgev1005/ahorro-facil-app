const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🚀 FIXING PASSWORD (PLAIN TEXT SET)...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // We set plain text password, let the model hook hash it ONCE.
    const scriptContent = `
const { User } = require('../src/models');
const sequelize = require('../src/config/database');

async function fix() {
    try {
        await sequelize.authenticate();
        console.log('✅ DB Connected');
        
        const email = 'riveyes@gmail.com';
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            console.error('❌ User not found:', email);
            return;
        }
        
        // SET PLAIN TEXT - Hook will hash it
        user.password = '123456'; 
        await user.save();
        
        console.log('✅ PASSWORD FIXED for', email);
        console.log('   Value set to "123456" (hooks will hash it)');
        
    } catch (error) {
        console.error('🔥 Error:', error);
    } finally {
        await sequelize.close();
    }
}

fix();
`;

    const base64Content = Buffer.from(scriptContent).toString('base64');

    const cmd = `
    cd ${REMOTE_DIR}
    echo "${base64Content}" | base64 -d > scripts/fix_password_riveyes.js
    node scripts/fix_password_riveyes.js
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ FIX TASK DONE');
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
