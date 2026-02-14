const { Client } = require('ssh2');

const config = {
    host: '75.119.154.6',
    port: 22,
    username: 'root',
    password: 'xz18219jl'
};

const REMOTE_DIR = '/var/www/ahorro_facil';

const conn = new Client();

console.log('🔍 Connecting to VPS to Trace Process...');

conn.on('ready', () => {
    console.log('✅ Connected.');

    const cmd = `
    echo "--- PORT 3001 PID ---"
    # Get PID (using ss or lsof or netstat or fuser)
    PID=$(lsof -t -i:3001 || ss -lptn 'sport = :3001' | grep -o 'pid=[0-9]*' | cut -d= -f2 | head -n1)
    
    if [ -z "$PID" ]; then
        echo "No process on 3001 found!"
        # Maybe it's on 3000?
        echo "Checking 3000..."
        PID=$(lsof -t -i:3000 || ss -lptn 'sport = :3000' | grep -o 'pid=[0-9]*' | cut -d= -f2 | head -n1)
    fi
    
    if [ -n "$PID" ]; then
        echo "PID: $PID"
        echo "--- PROCESS CWD ---"
        ls -l /proc/$PID/cwd
        
        echo "--- PROCESS CMDLINE ---"
        cat /proc/$PID/cmdline
        
        echo "\n--- PROCESS EXE ---"
        ls -l /proc/$PID/exe
    else
        echo "No process found on 3000 or 3001."
    fi
    
    echo "\n--- DOCKER PS ---"
    docker ps || echo "Docker not found"
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => console.log(data.toString()))
            .stderr.on('data', (data) => console.log('STDERR: ' + data));
    });
}).connect(config);
