import React from 'react';
import { useDrop } from 'react-dnd';
import { Claude } from '../../types/ipc';

interface ClaudeCardProps {
  claude: Claude;
  onClick: () => void;
  onAssignTicket?: (ticketId: string) => void;
}

const ClaudeCard: React.FC<ClaudeCardProps> = ({ claude, onClick, onAssignTicket }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'TICKET',
    drop: (item: { ticketId: string }) => {
      if (onAssignTicket) {
        onAssignTicket(item.ticketId);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`card shadow-xl hover:shadow-2xl transition-shadow duration-300 cursor-pointer ${isOver ? 'border-2 border-[#da7756]' : ''
        }`}
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
      onClick={onClick}
    >
      <div className="card-body p-4 pb-0 flex flex-row">
        <div className="min-w-0 mr-2">
          <h2 className="card-title text-white text-lg mb-1">{claude.name}</h2>
          <p className="text-sm text-gray-300 mb-1">{claude.title}</p>
          <p className="text-xs font-mono text-gray-400 truncate">{claude.directory}</p>
        </div>
        <img src="/claude-office.png" alt="Claude" className="w-[200px] h-[200px] object-contain" />
      </div>
    </div>
  );
};

export default ClaudeCard;