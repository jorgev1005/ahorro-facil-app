const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🔍 Connecting to VPS to Create Table via SQL...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    // We will use the existing Sequelize instance but simpler
    const syncScript = `
    const { Sequelize, DataTypes } = require('sequelize');
    // Load config manually to avoid path issues
    const sequelize = new Sequelize('ahorro_db', 'calidad', 'Q1_w2_E3_r4', {
        host: 'localhost',
        dialect: 'postgres',
        logging: console.log
    });

    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true // Allow null for Google Auth
        },
        googleId: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        avatar: {
            type: DataTypes.STRING,
            allowNull: true
        },
        isAdmin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        timestamps: true
    });

    (async () => {
        try {
            await sequelize.authenticate();
            console.log('DB Connection OK.');
            await User.sync({ alter: true });
            console.log('✅ User Table Synced successfully.');
            process.exit(0);
        } catch (error) {
            console.error('Failure:', error);
            process.exit(1);
        }
    })();
    `;

    conn.exec(`echo "${syncScript.replace(/\n/g, ' ')}" > ${REMOTE_DIR}/fix_user_table.js`, (err, stream) => {
        if (err) throw err;
        stream.on('close', () => {
            conn.exec(`cd ${REMOTE_DIR} && node fix_user_table.js`, (err, stream) => {
                if (err) throw err;
                stream.on('data', (data) => console.log(data.toString())); // Fix buffer output
                stream.stderr.on('data', (data) => console.log('STDERR:', data.toString()));
                stream.on('close', () => conn.end());
            });
        });
    });

}).connect(config);
