const sequelize = require('./src/config/database');

async function updateSchema() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB.');

        const queryInterface = sequelize.getQueryInterface();

        // Add payoutCurrency
        try {
            await queryInterface.addColumn('Participants', 'payoutCurrency', {
                type: 'VARCHAR(10)',
                allowNull: true,
                defaultValue: 'USD'
            });
            console.log('Added payoutCurrency');
        } catch (e) { console.log('payoutCurrency error:', e.message); }

        // Add payoutExchangeRate
        try {
            await queryInterface.addColumn('Participants', 'payoutExchangeRate', {
                type: 'DECIMAL(10, 2)',
                allowNull: true
            });
            console.log('Added payoutExchangeRate');
        } catch (e) { console.log('payoutExchangeRate error:', e.message); }

        // Add payoutAmountBs
        try {
            await queryInterface.addColumn('Participants', 'payoutAmountBs', {
                type: 'DECIMAL(20, 2)',
                allowNull: true
            });
            console.log('Added payoutAmountBs');
        } catch (e) { console.log('payoutAmountBs error:', e.message); }

        console.log('Migration Done.');
        process.exit(0);
    } catch (error) {
        console.error('Migration Failed:', error);
        process.exit(1);
    }
}

updateSchema();
