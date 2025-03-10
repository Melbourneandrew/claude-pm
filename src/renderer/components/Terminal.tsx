import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import 'xterm/css/xterm.css';

const Terminal: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const xterm = new XTerm({
      cols: 80,
      rows: 24,
      fontSize: 14,
      fontFamily: 'monospace',
      scrollback: 1000,
      theme: {
        background: '#282c34'
      }
    });

    xtermRef.current = xterm;
    xterm.open(terminalRef.current);

    // Disable local echo
    xterm.options.screenReaderMode = true;

    // Handle input
    const dataListener = (data: string) => {
      console.log('data', data);
      window.electron.sendInput(data);
    };
    xterm.onData(dataListener);

    // Handle output
    const removeCommandOutput = window.electron.onCommandOutput((output) => {
      if (xtermRef.current) {
        xtermRef.current.write(output.data);
      }
    });

    return () => {
      // Clean up the command output listener
      removeCommandOutput();

      // Clean up xterm
      if (xtermRef.current) {
        xtermRef.current.dispose();
        xtermRef.current = null;
      }
    };
  }, []);

  return <div ref={terminalRef} style={{ height: '100%' }} />;
};

export default Terminal;