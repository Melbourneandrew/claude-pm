import { setupClaudeHandlers } from './claude';
import { setupCommandHandlers } from './command';
import { setupTicketHandlers } from './ticket';

export const setupIpcHandlers = () => {
    setupClaudeHandlers();
    setupCommandHandlers();
    setupTicketHandlers();
}; 