const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🔍 Connecting to VPS to Debug Startup...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    const script = `
    try {
        console.log("1. Loading express...");
        const express = require('express');
        console.log("✅ Express loaded.");
        
        console.log("2. Loading cors...");
        const cors = require('cors');
        console.log("✅ Cors loaded.");
        
        console.log("3. Loading ./src/app...");
        const app = require('./src/app');
        console.log("✅ ./src/app loaded.");
        
    } catch (e) {
        console.error("❌ CRASH:", e);
    }
    `;

    // Write script
    conn.exec(`echo "${script.replace(/\n/g, ' ')}" > ${REMOTE_DIR}/debug_startup.js`, (err, stream) => {
        if (err) throw err;
        stream.on('close', () => {
            conn.exec(`cd ${REMOTE_DIR} && node debug_startup.js`, (err, stream) => {
                if (err) throw err;
                stream.on('data', (data) => console.log(data.toString()))
                    .stderr.on('data', (data) => console.log('STDERR: ' + data));
                stream.on('close', () => conn.end());
            });
        });
    });
}).connect(config);
