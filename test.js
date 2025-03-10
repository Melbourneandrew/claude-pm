const { spawn } = require('child_process');

// Spawn the claude process
const claude = spawn('claude', ["what is the capital of france?"])
// Handle stdout data
claude.stdout.on('data', (data) => {
    console.log(`${data}`);
});

// Handle stderr data
claude.stderr.on('data', (data) => {
    console.error(`Error: ${data}`);
});

// Handle process exit
claude.on('exit', (code) => {
    if (code === 0) {
        console.log('Claude process completed successfully');
    } else {
        console.error(`Claude process exited with code ${code}`);
    }
});

// Handle any errors in spawning the process
claude.on('error', (error) => {
    console.error(`Failed to start Claude process: ${error.message}`);
});

// End the stdin stream since we don't need to send any more data
claude.stdin.end();
