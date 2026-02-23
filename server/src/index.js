const app = require('./app');
const sequelize = require('./config/database');
const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        // Test DB Connection
        await sequelize.authenticate();
        console.log('✅ Database connected successfully.');

        // Sync Models (alter: true checks current schema and updates it - safe for prod usually, backups recommended)
        // await sequelize.sync({ alter: true }); // Temporarily disabling auto-sync to prevent schema drops
        console.log('✅ Database connected (auto-sync disabled).');

        // Initialize Daily Cron Jobs
        require('./jobs/subscriptionCron');
        console.log('✅ Background jobs initialized.');

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        process.exit(1);
    }
}

startServer();
