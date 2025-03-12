import { ipcMain, BrowserWindow, IpcMainInvokeEvent } from 'electron';
import * as pty from 'node-pty';
import os from 'os';
import fs from 'fs';
import path from 'path';

const shell = os.platform() === 'win32' ? 'powershell.exe' : '/bin/zsh';
const shellArgs = os.platform() === 'win32' ? [] : [];

// Store PTY processes for each Claude
const ptyProcesses: Map<string, pty.IPty> = new Map();
// Store terminal output history for each Claude
const terminalHistory: Map<string, string> = new Map();

// Maximum history size per terminal (in characters)
const MAX_HISTORY_SIZE = 100000;

// Helper to append to history with size limit
const appendToHistory = (claudeId: string, data: string) => {
    let history = terminalHistory.get(claudeId) || '';
    history += data;

    // Trim if exceeds max size (remove from start)
    if (history.length > MAX_HISTORY_SIZE) {
        history = history.slice(-MAX_HISTORY_SIZE);
    }

    terminalHistory.set(claudeId, history);
};

export const setupCommandHandlers = () => {
    // Read Claude configurations - use the same path as claude.ts
    const claudesConfigPath = path.join(__dirname, '..', '..', '..', 'src', 'claudes.json');
    console.log('Looking for claudes.json at:', claudesConfigPath);

    let claudesConfig;
    try {
        const configData = fs.readFileSync(claudesConfigPath, 'utf-8');
        console.log('Raw config data:', configData);
        claudesConfig = JSON.parse(configData);
        console.log('Parsed config:', claudesConfig);
    } catch (error) {
        console.error('Failed to load claudes.json:', error);
        // Create a default claude if config doesn't exist
        claudesConfig = {
            claudes: [{
                id: 'claude-1',
                name: 'Default Terminal',
                title: 'Terminal',
                directory: process.cwd()
            }]
        };
        console.log('Using default config:', claudesConfig);
    }

    // Create a PTY process for each Claude
    claudesConfig.claudes.forEach((claude: any) => {
        console.log(`Creating PTY process for Claude ${claude.id} in directory ${claude.directory}`);

        try {
            const ptyProcess = pty.spawn(shell, shellArgs, {
                name: 'xterm-256color',
                cols: 80,
                rows: 30,
                cwd: claude.directory,
                env: {
                    ...process.env,
                    TERM: 'xterm-256color'
                }
            });

            // Verify the process was created
            if (!ptyProcess || !ptyProcess.pid) {
                throw new Error('PTY process creation failed');
            }

            console.log(`PTY process created successfully with PID ${ptyProcess.pid}`);

            // Store the process
            ptyProcesses.set(claude.id, ptyProcess);

            // Set up output handler for this process
            ptyProcess.onData((data) => {
                console.log(`PTY output for ${claude.id}:`, data);
                // Store the output in history
                appendToHistory(claude.id, data);

                const windows = BrowserWindow.getAllWindows();
                console.log(`Broadcasting to ${windows.length} windows`);

                windows.forEach((window: BrowserWindow) => {
                    window.webContents.send('terminal-output', {
                        claudeId: claude.id,
                        data
                    });
                });
            });

            // Handle process exit
            ptyProcess.onExit(({ exitCode, signal }) => {
                console.log(`PTY process ${claude.id} exited with code ${exitCode} and signal ${signal}`);
            });

        } catch (error) {
            console.error(`Failed to create PTY process for Claude ${claude.id}:`, error);
        }
    });

    // Handle input from renderer
    ipcMain.on('terminal-input', (event, { claudeId, data }) => {
        console.log(`Terminal input for ${claudeId}:`, data);
        const ptyProcess = ptyProcesses.get(claudeId);
        if (ptyProcess) {
            try {
                ptyProcess.write(data);
                console.log(`Successfully wrote data to PTY process ${claudeId}`);
            } catch (error) {
                console.error(`Failed to write to PTY process ${claudeId}:`, error);
            }
        } else {
            console.error(`No PTY process found for Claude ${claudeId}`);
        }
    });

    // Add handler for requesting terminal history
    ipcMain.handle('get-terminal-history', (event, claudeId: string) => {
        console.log(`History requested for Claude ${claudeId}`);
        return terminalHistory.get(claudeId) || '';
    });

    // Clean up on app quit
    ipcMain.on('app-quit', () => {
        ptyProcesses.forEach((process, id) => {
            try {
                process.kill();
                console.log(`Killed PTY process for ${id}`);
            } catch (error) {
                console.error(`Failed to kill PTY process for ${id}:`, error);
            }
        });
        ptyProcesses.clear();
    });
}; 