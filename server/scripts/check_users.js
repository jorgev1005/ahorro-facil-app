const { User } = require('../src/models');
const sequelize = require('../src/config/database');

async function checkUsers() {
    try {
        await sequelize.authenticate();
        console.log('✅ DB Connected');

        const users = await User.findAll();

        console.log('\n--- CURRENT USERS ---');
        users.forEach(u => {
            console.log(`ID: ${u.id}`);
            console.log(`Name: ${u.name}`);
            console.log(`Email: ${u.email}`);
            console.log(`IsAdmin: ${u.isAdmin}`);
            console.log(`Sub Status: ${u.subscriptionStatus}`);
            console.log(`Sub Ends: ${u.subscriptionEndsAt}`);
            console.log('---------------------');
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkUsers();
