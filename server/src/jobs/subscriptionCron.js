const cron = require('node-cron');
const { User } = require('../models');
const { Op } = require('sequelize');
const { sendEmail } = require('../services/mailer');

const checkSubscriptions = async () => {
    console.log('[CRON] Starting daily subscription check...');
    try {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const next3Days = new Date(today);
        next3Days.setDate(next3Days.getDate() + 3);

        // Find users expiring in next 3 days, or exactly expiring tomorrow, or already expired but still 'trial'/'active'
        const users = await User.findAll({
            where: {
                isAdmin: false, // Don't bother admins
                subscriptionEndsAt: {
                    [Op.lte]: next3Days // Less than or equal to 3 days from now
                },
                subscriptionStatus: ['active', 'trial'] // Avoid sending to already expired if we update status
            }
        });

        const expiringUsers = [];
        const expiredUsers = [];

        for (let user of users) {
            const endsAt = new Date(user.subscriptionEndsAt);
            const daysLeft = Math.ceil((endsAt - today) / (1000 * 60 * 60 * 24));

            if (daysLeft <= 0) {
                // Expired today or earlier
                user.subscriptionStatus = 'expired';
                await user.save();
                expiredUsers.push(user);

                await sendEmail({
                    to: user.email,
                    subject: 'Tu periodo de prueba en Ahorro Fácil ha expirado',
                    html: `
                        <h2>¡Hola ${user.name || ''}!</h2>
                        <p>Te escribimos para avisarte que tu periodo de prueba en <b>Ahorro Fácil</b> ha llegado a su fin.</p>
                        <p>Para seguir disfrutando de la organización de tus Bolsos, por favor contacta al administrador para renovar tu suscripción.</p>
                        <br/>
                        <p>Saludos,<br/>El equipo de Ahorro Fácil</p>
                    `
                });
            } else if (daysLeft === 3 || daysLeft === 1) {
                // Expiring in exactly 3 or 1 days (to avoid spamming every day)
                expiringUsers.push({ user, daysLeft });

                await sendEmail({
                    to: user.email,
                    subject: `Tu periodo de prueba en Ahorro Fácil vence en ${daysLeft} ${daysLeft === 1 ? 'día' : 'días'}`,
                    html: `
                        <h2>¡Hola ${user.name || ''}!</h2>
                        <p>Te escribimos para avisarte que tu periodo de prueba en <b>Ahorro Fácil</b> está por finalizar en <b>${daysLeft} ${daysLeft === 1 ? 'día' : 'días'}</b> (${endsAt.toLocaleDateString()}).</p>
                        <p>Si deseas continuar utilizando la plataforma sin interrupciones, comunícate con el administrador pronto.</p>
                        <br/>
                        <p>Saludos,<br/>El equipo de Ahorro Fácil</p>
                    `
                });
            }
        }

        // Notify Super Admin if there was activity
        if (expiringUsers.length > 0 || expiredUsers.length > 0) {
            let adminHtml = '<h2>Resumen Diario de Suscripciones</h2>';

            if (expiredUsers.length > 0) {
                adminHtml += '<h3>Usuarios expirados hoy:</h3><ul>';
                expiredUsers.forEach(u => adminHtml += `<li>${u.name} (${u.email})</li>`);
                adminHtml += '</ul>';
            }

            if (expiringUsers.length > 0) {
                adminHtml += '<h3>Usuarios por expirar:</h3><ul>';
                expiringUsers.forEach(({ user, daysLeft }) => adminHtml += `<li>${user.name} (${user.email}) - Vence en ${daysLeft} días</li>`);
                adminHtml += '</ul>';
            }

            // Fallback email or use env variable
            const adminEmail = process.env.ADMIN_EMAIL || 'jorge.verenzuela@gmail.com';

            await sendEmail({
                to: adminEmail,
                subject: 'Resumen Semanal de Ahorro Fácil - Vencimientos',
                html: adminHtml
            });
            console.log(`[CRON] Summary sent to admin ${adminEmail}`);
        }

        console.log('[CRON] Subscription check completed.');

    } catch (error) {
        console.error('[CRON] Error during subscription check:', error);
    }
};

// Schedule job to run every day at Midnight (00:00) server time
// cron.schedule('0 0 * * *', checkSubscriptions);

// For testing, schedule every minute: '* * * * *', but typically daily.
cron.schedule('0 0 * * *', () => {
    checkSubscriptions();
}, {
    scheduled: true,
    timezone: "America/Caracas" // Adjust to Venezuela time
});

module.exports = { checkSubscriptions };
