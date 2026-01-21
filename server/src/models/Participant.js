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
    }
    // bolsoId will be added via association
}, {
    timestamps: true
});

module.exports = Participant;
