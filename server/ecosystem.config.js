module.exports = {
    apps: [{
        name: "ahorro-facil-api",
        script: "./src/index.js",
        env_production: {
            NODE_ENV: "production",
            PORT: 3000,
            // DATABASE_URL to be set in VPS env or here (better in .env file loaded by dotenv)
        }
    }]
}
