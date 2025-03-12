import { setupClaudeHandlers } from './claude';
import { setupCommandHandlers } from './command';

export const setupIpcHandlers = () => {
    setupClaudeHandlers();
    setupCommandHandlers();
}; 