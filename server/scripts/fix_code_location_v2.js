const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🔍 Connecting to VPS to Move Files (Try 2)...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    const cmd = `
    cd ${REMOTE_DIR}
    
    if [ -d "package" ]; then
        echo "Found package folder. Inspecting..."
        ls -F package/
        
        echo "Moving files from package/ to root..."
        cp -r package/* .
        echo "Files updated from package/."
        
        # Cleanup
        # rm -rf package
    else
        echo "Package folder not found!"
        exit 1
    fi

    # Restart App on 3001
    echo "Restarting App..."
    pm2 delete ahorro-facil-api || true
    PORT=3001 pm2 start src/index.js --name ahorro-facil-api --update-env
    pm2 save
    echo "App restarted with NEW CODE."
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
