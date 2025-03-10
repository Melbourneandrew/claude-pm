import React from 'react';
import { useDrop } from 'react-dnd';
import { Claude } from '../types';

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
      <div className="card-body">
        <h2 className="card-title text-white">{claude.name}</h2>
        <p className="text-sm text-gray-300">{claude.title}</p>
        <div className="mt-2">
          <p className="text-xs font-mono text-gray-400 truncate">{claude.directory}</p>
        </div>
      </div>
    </div>
  );
};

export default ClaudeCard;