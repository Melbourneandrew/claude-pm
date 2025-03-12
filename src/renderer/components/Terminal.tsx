import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';
import { TerminalInput, TerminalOutput } from '../../types/ipc';

interface TerminalProps {
  claudeId: string;
}

const Terminal: React.FC<TerminalProps> = ({ claudeId }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize terminal
    const terminal = new XTerm({
      theme: {
        background: '#2C2C2C',
        foreground: 'white',
        cursor: 'white'
      },
      fontFamily: 'monospace',
      fontSize: 14,
      cursorBlink: true,
      convertEol: true,
    });

    // Store terminal instance
    xtermRef.current = terminal;

    // Open terminal in container
    terminal.open(terminalRef.current);

    // Load terminal history
    window.electron.getTerminalHistory(claudeId).then((history: string) => {
      if (history) {
        terminal.write(history);
      }
    });

    // Focus terminal immediately
    terminal.focus();

    // Focus terminal on click
    const focusHandler = () => {
      terminal.focus();
    };
    terminalRef.current.addEventListener('click', focusHandler);

    // Handle input
    terminal.onData((data: string) => {
      console.log('Terminal input:', data);
      // Send to main process - removed local echo since PTY handles it
      window.electron.sendInput({ claudeId, data });
    });

    // Handle output from PTY
    const removeCommandOutput = window.electron.onCommandOutput((output: TerminalOutput) => {
      if (output.claudeId === claudeId) {
        console.log('Terminal output:', output.data);
        terminal.write(output.data);
      }
    });

    return () => {
      removeCommandOutput();
      if (xtermRef.current) {
        xtermRef.current.dispose();
        xtermRef.current = null;
      }
      // Clean up click handler
      terminalRef.current?.removeEventListener('click', focusHandler);
    };
  }, [claudeId]);

  return (
    <div ref={terminalRef} className="h-full w-full" />
  );
};

export default Terminal;