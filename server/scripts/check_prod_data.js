const { Sequelize } = require('sequelize');

// Connection string from user's known environment (based on previous interactions)
const sequelize = new Sequelize('postgres://postgres:19772002jJ*@75.119.154.6:5432/ahorro_facil', {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: false // User set this to false previously or we can try with it if needed for external connection?
        // Usually direct IP connection requires allowing the IP in pg_hba.conf, 
        // but let's try assuming the user is running this LOCALLY to connect REMOTELY.
        // Wait, remote connections to Postgres might be blocked by firewall.
        // BETTER STRATEGY: Create a script the USER runs ON THE VPS.
    }
});

async function checkData() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to Remote DB');

        const [bolsos] = await sequelize.query('SELECT * FROM "Bolsos"');
        console.log(`📊 Total Bolsos found: ${bolsos.length}`);

        if (bolsos.length > 0) {
            console.log('Last Bolso:', bolsos[bolsos.length - 1]);
        } else {
            console.log('⚠️ The database is empty! Data migration might be needed.');
        }

    } catch (error) {
        console.error('❌ Connection failed:', error.message);
    } finally {
        await sequelize.close();
    }
}

checkData();
