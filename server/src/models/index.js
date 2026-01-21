const Bolso = require('./Bolso');
const Participant = require('./Participant');
const Payment = require('./Payment');

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

module.exports = {
    Bolso,
    Participant,
    Payment
};
