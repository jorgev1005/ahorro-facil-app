const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://user:pass@localhost:5432/ahorro_facil', {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost') && !process.env.DATABASE_URL.includes('127.0.0.1')) ? {
            require: true,
            rejectUnauthorized: false
        } : false
    }
});

module.exports = sequelize;
