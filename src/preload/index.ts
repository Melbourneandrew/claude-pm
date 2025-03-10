import { contextBridge, ipcRenderer } from 'electron';
import { TerminalOutput } from '../renderer/types';

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electron', {
  // Claude management
  getClaudes: () => ipcRenderer.invoke('get-claudes'),
  createClaude: (claude: { name: string; title: string; directory: string }) =>
    ipcRenderer.invoke('create-claude', claude),
  updateClaude: (id: string, updates: Partial<any>) =>
    ipcRenderer.invoke('update-claude', { id, updates }),
  deleteClaude: (id: string) =>
    ipcRenderer.invoke('delete-claude', id),

  // Terminal management
  sendInput: (data: string) => {
    ipcRenderer.send('terminal-input', data);
  },
  onCommandOutput: (callback: (data: TerminalOutput) => void) => {
    const listener = (_event: any, data: TerminalOutput) => callback(data);
    ipcRenderer.on('terminal-output', listener);
    return () => {
      ipcRenderer.removeListener('terminal-output', listener);
    };
  },
  onTerminalExit: (callback: (data: { claudeId: string }) => void) =>
    ipcRenderer.on('terminal-exit', (_event, data) => callback(data)),
  onTerminalError: (callback: (data: { claudeId: string; error: string }) => void) =>
    ipcRenderer.on('terminal-error', (_event, data) => callback(data)),

  // Ticket management
  createTicket: (ticket: { title: string; description: string; assignee: string }) =>
    ipcRenderer.invoke('create-ticket', ticket),
  getTickets: () => ipcRenderer.invoke('get-tickets'),
  updateTicket: (id: string, updates: Partial<any>) =>
    ipcRenderer.invoke('update-ticket', { id, updates }),
  assignTicket: (id: string, assignee: string) =>
    ipcRenderer.invoke('assign-ticket', { id, assignee })
});