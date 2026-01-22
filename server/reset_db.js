
const { Bolso } = require('./src/models');
const sequelize = require('./src/config/database');

async function reset() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Connection successful.');

        console.log('Deleting all Bolsos...');
        // Destroy all Bolsos. 
        // Sequelize associations with onDelete: 'CASCADE' should handle children (Participants, Payments)
        // provided the DB foreign keys were set up correctly by sync().
        const count = await Bolso.destroy({ where: {} });

        console.log(`Successfully deleted ${count} bolsos.`);
        process.exit(0);
    } catch (error) {
        console.error('Error resetting database:', error);
        process.exit(1);
    }
}

reset();
