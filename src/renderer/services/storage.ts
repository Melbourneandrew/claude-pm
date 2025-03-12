import { Ticket } from '../../types/ipc';

const TICKETS_KEY = 'claude_pm_tickets';

export const storage = {
    createTicket: (ticket: Omit<Ticket, 'id' | 'created_at' | 'status'>): Ticket => {
        const tickets = storage.getTickets();
        const newTicket: Ticket = {
            id: crypto.randomUUID(),
            ...ticket,
            createdAt: Date.now(),
            status: 'open'
        };

        tickets.push(newTicket);
        localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
        return newTicket;
    },

    getTickets: (): Ticket[] => {
        const ticketsJson = localStorage.getItem(TICKETS_KEY);
        return ticketsJson ? JSON.parse(ticketsJson) : [];
    },

    updateTicket: (id: string, updates: Partial<Omit<Ticket, 'id' | 'created_at'>>): Ticket | null => {
        const tickets = storage.getTickets();
        const ticketIndex = tickets.findIndex(t => t.id === id);

        if (ticketIndex === -1) return null;

        const updatedTicket = {
            ...tickets[ticketIndex],
            ...updates
        };

        tickets[ticketIndex] = updatedTicket;
        localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
        return updatedTicket;
    },

    assignTicket: (id: string, assignee: string): Ticket | null => {
        return storage.updateTicket(id, { assignee });
    },

    getTicket: (id: string): Ticket | null => {
        const tickets = storage.getTickets();
        return tickets.find(t => t.id === id) || null;
    }
}; 