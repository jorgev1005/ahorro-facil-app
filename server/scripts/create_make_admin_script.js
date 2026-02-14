const snippet = `
const { User } = require('../src/models');
const sequelize = require('../src/config/database');

const makeAdmin = async () => {
    try {
        const email = process.argv[2];
        if (!email) {
            console.error('Usage: node make_admin.js <email>');
            process.exit(1);
        }

        await sequelize.authenticate();
        console.log('✅ Connected to DB');

        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.error('❌ User not found:', email);
            process.exit(1);
        }

        user.isAdmin = true;
        await user.save();
        console.log(\`✅ User \${user.email} is now an ADMIN.\`);
        
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

makeAdmin();
`;

const fs = require('fs');
fs.writeFileSync('server/scripts/make_admin.js', snippet.trim());
