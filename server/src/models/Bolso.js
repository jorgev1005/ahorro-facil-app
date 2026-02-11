const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Bolso = sequelize.define('Bolso', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    frequency: {
        type: DataTypes.ENUM('weekly', 'biweekly', 'monthly'),
        defaultValue: 'weekly'
    },
    startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    duration: {
        type: DataTypes.INTEGER,
        defaultValue: 10
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 30.00
    },
    schedule: {
        type: DataTypes.JSONB, // Stores the array of calculated dates
        defaultValue: []
    },
    archived: {
        type: DataTypes.BOOLEAN,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true, // Allow null for migration, then enforce later
        references: {
            model: 'Users',
            key: 'id'
        }
    }
}, {
    timestamps: true
});

module.exports = Bolso;
