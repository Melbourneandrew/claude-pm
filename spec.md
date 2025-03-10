# Claude PM - Terminal Management System

## Overview
A desktop application built with Electron and React that manages multiple terminal sessions. Each terminal session ("Claude") is configured via a JSON file and can run commands independently, with real-time output streaming back to the UI.

## Electron Application
- Manages the main process and IPC communication
- Handles terminal process creation and management using node-pty
- Reads and writes to claudes.json configuration file
- Manages SQLite database for ticket storage
- Streams terminal output back to renderer process
- Manages working directories for each terminal session

## React Application (Renderer)
- Built with Vite, React Router, Tailwind CSS, and DaisyUI
- Main page displays cards for each configured Claude
- Each card shows:
  - Claude name and title
  - Current working directory
- Clicking a card will open a large modal with information about the Claude and the command prompt


## Data Structures

### SQLite Schema
```sql
CREATE TABLE tickets (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  assignee TEXT,
  created_at INTEGER NOT NULL,
  status TEXT CHECK(status IN ('open', 'in_progress', 'closed')) NOT NULL DEFAULT 'open'
);

CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_assignee ON tickets(assignee);
```

### Ticket Type
```typescript
interface Ticket {
  id: string;
  title: string;
  description: string;
  assignee: string;
  createdAt?: number;
}
```

### claudes.json Schema
```json
{
  "claudes": [
    {
      "id": "string",
      "name": "string",
      "title": "string",
      "directory": "string",
    }
  ]
}
```

### IPC Interface

#### Context Bridge API
```typescript
// Exposed to renderer process through contextBridge
interface ElectronAPI {
  // Ticket management
  createTicket: (ticket: {
    title: string;
    description: string;
    assignee: string;
  }) => Promise<string>; // Returns ticket ID
  
  getTickets: () => Promise<Array<Ticket>>;
  
  updateTicket: (id: string, updates: Partial<Ticket>) => Promise<void>;
  assignTicket: (id: string, assignee: string) => Promise<void>;
  
  // Command execution
  runCommand: (claudeId: string, command: string) => void;
  
  // Event listeners
  onCommandOutput: (callback: (data: {
    claudeId: string;
    output: string;
    timestamp: number;
  }) => void) => void;
}

// Implementation in preload.js
const electronAPI = {
  createTicket: (ticket) => ipcRenderer.invoke('create-ticket', ticket),
  getTickets: () => ipcRenderer.invoke('get-tickets'),
  updateTicket: (id, updates) => ipcRenderer.invoke('update-ticket', { id, updates }),
  runCommand: (claudeId, command) => 
    ipcRenderer.send('run-command', { claudeId, command }),
  onCommandOutput: (callback) => 
    ipcRenderer.on('command-output', (_, data) => callback(data))
};

contextBridge.exposeInMainWorld('electron', electronAPI);
```

#### Main Process Handlers
```typescript
// In main process
import { Database } from 'better-sqlite3';
const db = new Database('tickets.db');

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    assignee TEXT,
    created_at INTEGER NOT NULL,
    status TEXT CHECK(status IN ('open', 'in_progress', 'closed')) NOT NULL DEFAULT 'open'
  );
  
  CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
  CREATE INDEX IF NOT EXISTS idx_tickets_assignee ON tickets(assignee);
`);

ipcMain.handle('create-ticket', async (_, ticket) => {
  const stmt = db.prepare(`
    INSERT INTO tickets (id, title, description, assignee, created_at, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const id = crypto.randomUUID();
  const created_at = Date.now();
  
  stmt.run(id, ticket.title, ticket.description, ticket.assignee, created_at, 'open');
  return id;
});

ipcMain.handle('get-tickets', async () => {
  const stmt = db.prepare('SELECT * FROM tickets ORDER BY created_at DESC');
  return stmt.all();
});

ipcMain.handle('update-ticket', async (_, { id, updates }) => {
  const fields = Object.keys(updates)
    .map(key => `${key} = ?`)
    .join(', ');
    
  const stmt = db.prepare(`
    UPDATE tickets
    SET ${fields}
    WHERE id = ?
  `);
  
  stmt.run(...Object.values(updates), id);
});

ipcMain.on('run-command', (event, { claudeId, command }) => {
  // Execute command using node:child_process
  // Stream output back using event.sender.send('command-output', {...})
});
```

## Communication Flow
1. React app loads claudes.json on startup
2. User can start/stop individual Claude terminals
3. Commands sent via IPC to main process
4. Main process executes commands in appropriate terminal
5. Output streamed back via IPC to renderer
6. React components update in real-time with output
