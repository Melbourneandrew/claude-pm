export interface Claude {
  id: string;
  name: string;
  title: string;
  directory: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  assignee: string;
  createdAt?: number;
  status?: 'open' | 'in_progress' | 'closed';
}

export interface TerminalOutput {
  data: string;
}

// Electron API exposed through contextBridge
declare global {
  interface Window {
    electron: {
      getClaudes: () => Promise<Claude[]>;
      createClaude: (claude: Omit<Claude, 'id'>) => Promise<string>;
      updateClaude: (id: string, updates: Partial<Claude>) => Promise<void>;
      deleteClaude: (id: string) => Promise<void>;

      createTicket: (ticket: { title: string; description: string; assignee: string }) => Promise<string>;
      getTickets: () => Promise<Ticket[]>;
      updateTicket: (id: string, updates: Partial<Ticket>) => Promise<void>;
      assignTicket: (id: string, assignee: string) => Promise<void>;

      runCommand: (claudeId: string, command: string) => void;
      onCommandOutput: (callback: (data: TerminalOutput) => void) => () => void;
      sendInput: (data: string) => void;
    };
  }
}