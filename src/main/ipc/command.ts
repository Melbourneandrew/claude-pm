import { ipcMain, BrowserWindow } from 'electron';
import * as pty from 'node-pty';
import os from 'os';

const shell = os.platform() === 'win32' ? 'powershell.exe' : '/bin/bash';
const shellArgs = os.platform() === 'win32' ? [] : ['-e']; // Add -e flag for bash to prevent echo

export const setupCommandHandlers = () => {
    const ptyProcess = pty.spawn(shell, shellArgs, {
        name: 'xterm-color',
        cols: 80,
        rows: 24,
        cwd: process.env.HOME,
        env: process.env
    });

    // Send terminal output to renderer
    ptyProcess.onData((data) => {
        // Broadcast to all windows
        const windows = BrowserWindow.getAllWindows();
        windows.forEach((window: BrowserWindow) => {
            window.webContents.send('terminal-output', {
                data
            });
        });
    });

    // Handle input from renderer
    ipcMain.on('terminal-input', (event, data) => {
        ptyProcess.write(data);
    });
}; 