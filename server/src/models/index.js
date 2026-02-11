const Bolso = require('./Bolso');
const Participant = require('./Participant');
const Payment = require('./Payment');
const User = require('./User');

// Associations

// Bolso has many Participants
Bolso.hasMany(Participant, { foreignKey: 'bolsoId', onDelete: 'CASCADE' });
Participant.belongsTo(Bolso, { foreignKey: 'bolsoId' });

// Bolso has many Payments
Bolso.hasMany(Payment, { foreignKey: 'bolsoId', onDelete: 'CASCADE' });
Payment.belongsTo(Bolso, { foreignKey: 'bolsoId' });

// Participant has many Payments
Participant.hasMany(Payment, { foreignKey: 'participantId', onDelete: 'CASCADE' });
Payment.belongsTo(Participant, { foreignKey: 'participantId' });

// User has many Bolsos
User.hasMany(Bolso, { foreignKey: 'userId', onDelete: 'SET NULL' }); // Set Null to keep data safe if user deleted? Or CASCADE? Let's say SET NULL or restrict for now. Actually, if user is gone, bolso should be gone? Let's use CASCADE for cleanup, but be careful.
Bolso.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
    Bolso,
    Participant,
    Payment,
    User
};
