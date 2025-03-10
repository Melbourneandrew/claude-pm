import { ipcMain } from 'electron';

// We no longer need ticket handlers in the main process
// as we're using localStorage in the renderer process
export const setupTicketHandlers = () => {
    // Empty function as we've moved ticket handling to the renderer
}; 