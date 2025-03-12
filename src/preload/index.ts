import { contextBridge, ipcRenderer } from 'electron';
import { TerminalInput, TerminalOutput } from '../types/ipc';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    getClaudes: () => ipcRenderer.invoke('get-claudes'),
    createClaude: (claude: any) => ipcRenderer.invoke('create-claude', claude),
    updateClaude: (id: string, updates: any) => ipcRenderer.invoke('update-claude', id, updates),
    deleteClaude: (id: string) => ipcRenderer.invoke('delete-claude', id),
    openDirectory: () => ipcRenderer.invoke('open-directory'),
    onClaudeUpdate: (callback: any) => {
      const subscription = (_event: any, claudes: any) => callback(claudes);
      ipcRenderer.on('claude-update', subscription);
      return () => {
        ipcRenderer.removeListener('claude-update', subscription);
      };
    },
    sendInput: (input: TerminalInput) => {
      ipcRenderer.send('terminal-input', input);
    },
    onCommandOutput: (callback: (output: TerminalOutput) => void) => {
      const subscription = (_: any, value: TerminalOutput) => callback(value);
      ipcRenderer.on('terminal-output', subscription);
      return () => {
        ipcRenderer.removeListener('terminal-output', subscription);
      };
    },
    getTerminalHistory: (claudeId: string) => ipcRenderer.invoke('get-terminal-history', claudeId),
    onTerminalExit: (callback: (data: { claudeId: string }) => void) =>
      ipcRenderer.on('terminal-exit', (_event, data) => callback(data)),
    onTerminalError: (callback: (data: { claudeId: string; error: string }) => void) =>
      ipcRenderer.on('terminal-error', (_event, data) => callback(data)),
    createTicket: (ticket: { title: string; description: string; assignee: string }) =>
      ipcRenderer.invoke('create-ticket', ticket),
    getTickets: () => ipcRenderer.invoke('get-tickets'),
    updateTicket: (id: string, updates: Partial<any>) =>
      ipcRenderer.invoke('update-ticket', { id, updates }),
    assignTicket: (id: string, assignee: string) =>
      ipcRenderer.invoke('assign-ticket', { id, assignee })
  }
);