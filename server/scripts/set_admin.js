const { User } = require('../src/models');
const sequelize = require('../src/config/database');

async function updateUsers() {
    try {
        await sequelize.authenticate();
        console.log('✅ DB Connected');

        // Update Jorge (Super Admin)
        const jorge = await User.findOne({ where: { email: 'jorge.verenzuela@gmail.com' } }); // Correct email? Or 'jorgev1005@gmail.com'? I saw jorge.verenzuela@gmail in the prompt.
        if (jorge) {
            jorge.isAdmin = true;
            jorge.subscriptionStatus = 'active';
            // Set expiry far in future
            jorge.subscriptionEndsAt = new Date('2099-12-31');
            await jorge.save();
            console.log(`✅ Update Jorge: Admin=${jorge.isAdmin}`);
        } else {
            console.log('❌ Jorge user not found');
            // Create him if missing? No, user said he exists. Maybe check email spelling from previous logs.
        }

        // Update Riveyes (Regular User, Active)
        const riveyes = await User.findOne({ where: { email: 'riveyes@gmail.com' } });
        if (riveyes) {
            riveyes.isAdmin = false;
            riveyes.subscriptionStatus = 'active';
            // Give her 1 year of access as "First User"
            const nextYear = new Date();
            nextYear.setFullYear(nextYear.getFullYear() + 1);
            riveyes.subscriptionEndsAt = nextYear;
            await riveyes.save();
            console.log(`✅ Update Riveyes: Status=${riveyes.subscriptionStatus}, Ends=${riveyes.subscriptionEndsAt}`);
        } else {
            console.log('❌ Riveyes user not found');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

updateUsers();
