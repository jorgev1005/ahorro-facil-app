const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Participant = sequelize.define('Participant', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    turn: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    payoutDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    payoutAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    payoutReference: {
        type: DataTypes.STRING,
        allowNull: true
    },
    payoutCurrency: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'USD'
    },
    payoutExchangeRate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    payoutAmountBs: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: true
    }
    // bolsoId will be added via association
}, {
    timestamps: true
});

module.exports = Participant;
