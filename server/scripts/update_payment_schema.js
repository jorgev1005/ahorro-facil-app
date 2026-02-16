const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const conn = new Client();

console.log('🚀 MIGRATING PAYMENTS TABLE...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // Script to safely add columns using the App's initialized Sequelize instance
    const scriptContent = `
const sequelize = require('../src/config/database'); // Use the app's database config directly
const { DataTypes } = require('sequelize');

async function migrate() {
    const queryInterface = sequelize.getQueryInterface();
    const table = 'Payments';
    
    console.log('--- MIGRATION STARTED ---');
    
    try {
        await queryInterface.addColumn(table, 'currency', {
            type: DataTypes.STRING,
            defaultValue: 'USD'
        });
        console.log('✅ Added column: currency');
    } catch (e) {
        console.log('⚠️ Column currency: ' + e.message); // Likely "Duplicate column name"
    }

    try {
        await queryInterface.addColumn(table, 'exchangeRate', {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        });
        console.log('✅ Added column: exchangeRate');
    } catch (e) {
        console.log('⚠️ Column exchangeRate: ' + e.message);
    }

    try {
        await queryInterface.addColumn(table, 'amountBs', {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        });
        console.log('✅ Added column: amountBs');
    } catch (e) {
        console.log('⚠️ Column amountBs: ' + e.message);
    }
    
    console.log('--- MIGRATION FINISHED ---');
}

migrate();
`;

    const base64Content = Buffer.from(scriptContent).toString('base64');

    const cmd = `
    cd /var/www/ahorro_facil
    echo "${base64Content}" | base64 -d > scripts/update_payment_schema.js
    node scripts/update_payment_schema.js
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
            console.log('✅ MIGRATION SCRIPT DONE');
        }).on('data', (d) => console.log(d.toString()))
            .stderr.on('data', (d) => console.log('STDERR: ' + d));
    });
}).connect(config);
