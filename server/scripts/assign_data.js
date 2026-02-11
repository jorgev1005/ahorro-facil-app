const snippet = `
const { Bolso, User } = require('../src/models');
const sequelize = require('../src/config/database');

const assignData = async () => {
    try {
        const email = process.argv[2];
        if (!email) {
            console.error('Please provide an email address as an argument.');
            process.exit(1);
        }

        await sequelize.authenticate();
        console.log('✅ Connected to DB');

        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.error('❌ User not found:', email);
            process.exit(1);
        }

        console.log(\`Found User: \${user.name} (\${user.id})\`);

        const [updated] = await Bolso.update(
            { userId: user.id },
            { where: { userId: null } }
        );

        console.log(\`✅ Successfully moved \${updated} bolsos to user \${user.email}\`);
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

assignData();
`;

const fs = require('fs');
// Write directly
fs.writeFileSync('server/scripts/assign_data.js', snippet.trim());
