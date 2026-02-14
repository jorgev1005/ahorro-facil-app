const snippet = `
const { Bolso, User } = require('../src/models');
const sequelize = require('../src/config/database');

const unassignData = async () => {
    try {
        const email = process.argv[2];
        if (!email) {
            console.error('Usage: node unassign_data.js <email>');
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

        // Find bolsos owned by this user
        const bolsos = await Bolso.findAll({ where: { userId: user.id } });
        console.log(\`Found \${bolsos.length} bolsos owned by user.\`);

        if (bolsos.length > 0) {
            const [updated] = await Bolso.update(
                { userId: null },
                { where: { userId: user.id } }
            );
            console.log(\`✅ Successfully unassigned \${updated} bolsos from \${user.email}\`);
        } else {
            console.log('⚠️ No bolsos to unassign.');
        }
        
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

unassignData();
`;

const fs = require('fs');
fs.writeFileSync('server/scripts/unassign_data.js', snippet.trim());
