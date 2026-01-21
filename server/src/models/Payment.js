const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    scheduledDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    paidAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    amountPaid: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('partial', 'paid'), // Pending is implied if record exists but status is null, or we can use schedule to determine pending
        defaultValue: 'partial'
    },
    reference: {
        type: DataTypes.STRING,
        allowNull: true
    },
    currency: {
        type: DataTypes.STRING, // 'USD', 'BS', etc.
        defaultValue: 'USD'
    },
    exchangeRate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    amountBs: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    receiptStatus: {
        type: DataTypes.STRING, // 'generated', 'sent'
        defaultValue: 'generated'
    }
    // bolsoId and participantId added via association
}, {
    timestamps: true
});

module.exports = Payment;
