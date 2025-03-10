import React, { useState, useEffect, useRef } from 'react';
import { CommandOutput } from '../types';

interface CommandOutputViewerProps {
    claudeId: string;
}

const CommandOutputViewer: React.FC<CommandOutputViewerProps> = ({ claudeId }) => {
    const [outputHistory, setOutputHistory] = useState<string[]>([]);
    const outputRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleCommandOutput = (data: CommandOutput) => {
            if (data.claudeId === claudeId) {
                setOutputHistory(prev => [...prev, data.output]);
            }
        };

        // Register the command output listener
        window.electron.onCommandOutput(handleCommandOutput);

        return () => {
            // No cleanup needed as the event listener is global
        };
    }, [claudeId]);

    useEffect(() => {
        // Scroll to bottom when new output is added
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [outputHistory]);

    return (
        <div className="flex flex-col h-full">
            <div
                ref={outputRef}
                className="command-output flex-grow font-mono p-4 bg-black text-green-400 overflow-auto rounded-md"
            >
                {outputHistory.map((output, index) => (
                    <span key={index} style={{ whiteSpace: 'pre-wrap' }}>{output}</span>
                ))}
            </div>
        </div>
    );
};

export default CommandOutputViewer; 