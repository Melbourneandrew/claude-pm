import React from 'react';
import { useDrag } from 'react-dnd';
import { Ticket } from '../../types/ipc';

interface TicketCardProps {
    ticket: Ticket;
    onClick: () => void;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, onClick }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'TICKET',
        item: { ticketId: ticket.id },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    const getAssigneeStyles = () => {
        return ticket.assignee
            ? 'border-[#da7756] text-[#da7756]'
            : 'border-gray-500 text-gray-500';
    };

    return (
        <div
            ref={drag}
            className={`card shadow-xl hover:shadow-2xl transition-shadow duration-300 cursor-move mb-4 ${isDragging ? 'opacity-50' : ''
                }`}
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
            onClick={onClick}
        >
            <div className="card-body">
                <div className="flex justify-between items-start">
                    <h2 className="card-title text-white">{ticket.title}</h2>
                    <div className="flex gap-2 items-center">
                        <div className={`px-2 py-1 rounded-full text-xs border ${getAssigneeStyles()}`}>
                            {ticket.assignee || 'Unassigned'}
                        </div>
                    </div>
                </div>
                <p className="text-sm text-gray-300 line-clamp-2">{ticket.description}</p>
                <div className="mt-2">
                    <p className="text-xs text-gray-400">
                        Created: {new Date(ticket.createdAt || Date.now()).toLocaleDateString()}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TicketCard; 