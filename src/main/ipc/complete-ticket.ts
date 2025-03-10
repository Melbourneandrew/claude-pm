import { ipcMain, IpcMainEvent } from 'electron';
import { spawn } from 'child_process';
import { Ticket } from '../types';

let isProcessing = false;

const executeCommand = (
    command: string,
    cwd: string,
    event: IpcMainEvent,
    claude_id: string
): Promise<void> => {
    return new Promise((resolve, reject) => {
        const shell = process.platform === 'win32' ? 'powershell.exe' : '/bin/bash';
        const shellArgs = process.platform === 'win32' ? ['-Command'] : ['-c'];

        const proc = spawn(shell, [...shellArgs, command], {
            cwd,
            env: process.env,
            shell: true
        });

        // Handle stdout
        proc.stdout.on('data', (data: Buffer) => {
            event.sender.send(`command-output-${claude_id}`, {
                output: data.toString(),
                timestamp: Date.now(),
            });
        });

        // Handle stderr
        proc.stderr.on('data', (data: Buffer) => {
            event.sender.send(`command-output-${claude_id}`, {
                output: data.toString(),
                timestamp: Date.now(),
            });
        });

        // Handle process completion
        proc.on('close', (code: number) => {
            event.sender.send(`command-output-${claude_id}`, {
                output: `\nProcess exited with code ${code}\n`,
                timestamp: Date.now(),
            });
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Process exited with code ${code}`));
            }
        });

        proc.on('error', (error: Error) => {
            event.sender.send(`command-output-${claude_id}`, {
                output: `Error: ${error.message}\n`,
                timestamp: Date.now(),
            });
            reject(error);
        });
    });
};

export const setupTicketHandlers = () => {
    ipcMain.on('process-ticket', async (event: IpcMainEvent, { ticket, claude_id, workingDirectory }: {
        ticket: Ticket;
        claude_id: string;
        workingDirectory: string;
    }) => {
        try {
            // If there's already a process running, don't start a new one
            if (isProcessing) {
                event.sender.send(`command-output-${claude_id}`, {
                    output: 'Another ticket is currently being processed...\n',
                    timestamp: Date.now(),
                });
                return;
            }

            isProcessing = true;

            // Execute commands in sequence
            try {
                const command = `claude "check out a new branch and implement the changes described in this ticket. When you are done, push the changes to the branch and create a pull request. Here is the ticket description: ${ticket.description}"`

                await executeCommand(command, workingDirectory, event, claude_id);

                event.sender.send(`ticket-commands-complete-${claude_id}`, {
                    ticketId: ticket.id,
                    timestamp: Date.now(),
                });
            } finally {
                isProcessing = false;
            }
        } catch (error: unknown) {
            console.error('Error processing ticket:', error);
            event.sender.send(`ticket-command-error-${claude_id}`, {
                ticketId: ticket.id,
                error: error instanceof Error ? error.message : String(error),
                timestamp: Date.now(),
            });
            isProcessing = false;
        }
    });
};
