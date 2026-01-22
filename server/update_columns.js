const sequelize = require('./src/config/database');

async function updateSchema() {
    try {
        await sequelize.authenticate();
        console.log('Connected.');

        const queryInterface = sequelize.getQueryInterface();

        // Add payoutDate
        try {
            await queryInterface.addColumn('Participants', 'payoutDate', {
                type: 'TIMESTAMP WITH TIME ZONE',
                allowNull: true
            });
            console.log('Added payoutDate');
        } catch (e) { console.log('payoutDate likely exists or error:', e.message); }

        // Add payoutAmount
        try {
            await queryInterface.addColumn('Participants', 'payoutAmount', {
                type: 'DECIMAL(10, 2)',
                allowNull: true
            });
            console.log('Added payoutAmount');
        } catch (e) { console.log('payoutAmount likely exists or error:', e.message); }

        // Add payoutReference
        try {
            await queryInterface.addColumn('Participants', 'payoutReference', {
                type: 'VARCHAR(255)',
                allowNull: true
            });
            console.log('Added payoutReference');
        } catch (e) { console.log('payoutReference likely exists or error:', e.message); }

        console.log('Done.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

updateSchema();
