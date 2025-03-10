import { ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';
import { Claude } from '../types';

const configPath = path.join(__dirname, '..', '..', '..', 'src', 'claudes.json');

if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({ claudes: [] }, null, 2));
}

export const setupClaudeHandlers = () => {
    ipcMain.handle('get-claudes', () => {
        try {
            const configData = fs.readFileSync(configPath, 'utf8');
            const config = JSON.parse(configData);
            return Array.isArray(config.claudes) ? config.claudes : [];
        } catch (error) {
            console.error('Error reading config file:', error);
            return [];
        }
    });
}; 