export interface TerminalInput {
    claudeId: string;
    data: string;
}

export interface TerminalOutput {
    claudeId: string;
    data: string;
}

export interface Ticket {
    id: string;
    title: string;
    description: string;
    assignee: string;
    createdAt?: number;
    status?: 'open' | 'in_progress' | 'closed';
}

export interface Claude {
    id: string;
    name: string;
    title: string;
    directory: string;
}

declare global {
    interface Window {
        electron: {
            getClaudes: () => Promise<Claude[]>;
            createClaude: (claude: Omit<Claude, "id">) => Promise<string>;
            updateClaude: (id: string, updates: Partial<Claude>) => Promise<void>;
            deleteClaude: (id: string) => Promise<void>;
            openDirectory: () => Promise<string | undefined>;
            onClaudeUpdate: (callback: (claudes: Claude[]) => void) => () => void;
            sendInput: (input: TerminalInput) => void;
            registerTerminalOutput: (claudeId: string) => Promise<{ success: boolean }>;
            onCommandOutput: (callback: (output: TerminalOutput) => void) => () => void;
            onTerminalExit: (callback: (data: { claudeId: string }) => void) => () => void;
            onTerminalError: (callback: (data: { claudeId: string; error: string }) => void) => () => void;
            getTerminalHistory: (claudeId: string) => Promise<string>;
            createTicket: (ticket: { title: string; description: string; assignee: string }) => Promise<string>;
            getTickets: () => Promise<Ticket[]>;
            updateTicket: (id: string, updates: Partial<Ticket>) => Promise<void>;
            assignTicket: (id: string, assignee: string) => Promise<void>;
            implementTicket: (ticketId: string, ticketDescription: string, claudeId: string) => Promise<void>;
        }
    }
} 