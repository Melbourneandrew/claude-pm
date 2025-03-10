const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');
const fixPath = require('fix-path');
fixPath();
const pty = require('node-pty');
const { setupDb } = require('./db');
const { Claude } = require('./types');

/** @type {import('electron').BrowserWindow | null} */
let mainWindow = null;
const db = setupDb();
const claudeProcesses = {};
const configPath = path.join(app.getPath('userData'), 'claudes.json');

// Ensure claudes.json exists
if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, JSON.stringify({ claudes: [] }, null, 2));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // In production, use the built files
  if (app.isPackaged && mainWindow) {
    mainWindow.loadFile(path.join(__dirname, '../../renderer/index.html'));
  } else if (mainWindow) {
    // In development, use the dev server
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Load claudes from config file
ipcMain.handle('get-claudes', () => {
  try {
    const configData = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(configData).claudes;
  } catch (error) {
    console.error('Error reading config file:', error);
    return [];
  }
});

// Create a new claude
ipcMain.handle('create-claude', (_, claude) => {
  try {
    const configData = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configData);

    const newClaude = {
      ...claude,
      id: uuidv4(),
    };

    config.claudes.push(newClaude);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    return newClaude.id;
  } catch (error) {
    console.error('Error creating claude:', error);
    throw error;
  }
});

// Update a claude
ipcMain.handle('update-claude', (_, { id, updates }) => {
  try {
    const configData = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configData);

    const claudeIndex = config.claudes.findIndex((c) => c.id === id);
    if (claudeIndex === -1) {
      throw new Error(`Claude with id ${id} not found`);
    }

    config.claudes[claudeIndex] = {
      ...config.claudes[claudeIndex],
      ...updates,
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Error updating claude:', error);
    throw error;
  }
});

// Delete a claude
ipcMain.handle('delete-claude', (_, id) => {
  try {
    const configData = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configData);

    config.claudes = config.claudes.filter((c) => c.id !== id);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    // Close the terminal process if it exists
    if (claudeProcesses[id]) {
      claudeProcesses[id].kill();
      delete claudeProcesses[id];
    }
  } catch (error) {
    console.error('Error deleting claude:', error);
    throw error;
  }
});

// Run a command in a claude terminal
ipcMain.on('run-command', (event, { claudeId, command }) => {
  try {
    const configData = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configData);

    const claude = config.claudes.find((c) => c.id === claudeId);
    if (!claude) {
      throw new Error(`Claude with id ${claudeId} not found`);
    }

    // Create a new terminal process if it doesn't exist
    if (!claudeProcesses[claudeId]) {
      const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash';
      claudeProcesses[claudeId] = pty.spawn(shell, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: claude.directory,
        env: process.env,
      });

      // Listen for output from the terminal
      claudeProcesses[claudeId].onData((data) => {
        event.sender.send('command-output', {
          claudeId,
          output: data,
          timestamp: Date.now(),
        });
      });
    }

    // Send the command to the terminal
    claudeProcesses[claudeId].write(`${command}\r`);
  } catch (error) {
    console.error('Error running command:', error);
    event.sender.send('command-output', {
      claudeId,
      output: `Error: ${error.message}`,
      timestamp: Date.now(),
    });
  }
});

// Create a new ticket
ipcMain.handle('create-ticket', (_, ticket) => {
  try {
    const id = uuidv4();
    const createdAt = Date.now();

    const stmt = db.prepare(`
      INSERT INTO tickets (id, title, description, assignee, created_at, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, ticket.title, ticket.description, ticket.assignee, createdAt, 'open');

    return id;
  } catch (error) {
    console.error('Error creating ticket:', error);
    throw error;
  }
});

// Get all tickets
ipcMain.handle('get-tickets', () => {
  try {
    const stmt = db.prepare('SELECT * FROM tickets ORDER BY created_at DESC');
    return stmt.all();
  } catch (error) {
    console.error('Error getting tickets:', error);
    throw error;
  }
});

// Update a ticket
ipcMain.handle('update-ticket', (_, { id, updates }) => {
  try {
    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(', ');

    const stmt = db.prepare(`
      UPDATE tickets
      SET ${fields}
      WHERE id = ?
    `);

    stmt.run(...Object.values(updates), id);
  } catch (error) {
    console.error('Error updating ticket:', error);
    throw error;
  }
});

// Assign a ticket
ipcMain.handle('assign-ticket', (_, { id, assignee }) => {
  try {
    const stmt = db.prepare(`
      UPDATE tickets
      SET assignee = ?, status = 'in_progress'
      WHERE id = ?
    `);

    stmt.run(assignee, id);
  } catch (error) {
    console.error('Error assigning ticket:', error);
    throw error;
  }
});