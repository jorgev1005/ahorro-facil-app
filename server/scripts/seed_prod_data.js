const sequelize = require('../src/config/database');
const { Bolso, Participant } = require('../src/models');
require('dotenv').config();

async function seed() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Check if data exists
        const count = await Bolso.count();
        if (count > 0) {
            console.log(`Database already contains ${count} Bolsos. Skipping seed.`);
            process.exit(0);
        }

        console.log('Database is empty. Seeding initial data...');

        // Generate schedule dates (10 weeks starting today)
        const schedule = [];
        let currentDate = new Date(); // Start today

        for (let i = 0; i < 10; i++) {
            const date = new Date(currentDate);
            date.setDate(currentDate.getDate() + (i * 7));
            schedule.push(date.toISOString().split('T')[0]);
        }

        const bolso = await Bolso.create({
            name: 'Bolso Inicial',
            frequency: 'weekly',
            startDate: schedule[0],
            duration: 10,
            amount: 30.00,
            schedule: schedule
        });

        console.log(`Created Bolso: ${bolso.name}`);

        const participantsNames = [
            'Juan Pérez', 'María Rodríguez', 'Carlos González', 'Ana Martínez', 'Luis Hernández',
            'Laura López', 'José García', 'Elena Sánchez', 'Miguel Torres', 'Sofía Ramírez'
        ];

        const participantsData = participantsNames.map((name, index) => ({
            name,
            bolsoId: bolso.id,
            turn: index + 1,
            payoutDate: schedule[index]
        }));

        await Participant.bulkCreate(participantsData);
        console.log(`Created ${participantsData.length} participants.`);

        console.log('Seeding completed successfully!');
    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        await sequelize.close();
    }
}

seed();
