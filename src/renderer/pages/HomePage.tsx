import React, { useState, useEffect } from 'react';
import ClaudeCard from '../components/ClaudeCard';
import Terminal from '../components/Terminal';
import TicketCard from '../components/TicketCard';
import AddTicketForm from '../components/AddTicketForm';
import { Claude, Ticket } from '../types';
import { storage } from '../services/storage';

const HomePage: React.FC = () => {
  const [claudes, setClaudes] = useState<Claude[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedClaude, setSelectedClaude] = useState<Claude | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddTicket, setShowAddTicket] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [loadedClaudes, loadedTickets] = await Promise.all([
        window.electron.getClaudes(),
        storage.getTickets()
      ]);
      setClaudes(loadedClaudes);
      setTickets(loadedTickets);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClaudeClick = (claude: Claude) => {
    setSelectedClaude(claude);
  };

  const handleCloseTerminal = () => {
    setSelectedClaude(null);
  };

  const handleTicketClick = (ticket: Ticket) => {
    // TODO: Implement ticket detail view
    console.log('Ticket clicked:', ticket);
  };

  const handleTicketAssignment = async (ticketId: string, claudeName: string) => {
    try {
      await storage.assignTicket(ticketId, claudeName);
      loadData();
    } catch (error) {
      console.error('Error assigning ticket:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Left Column - Tickets */}
      <div className="w-80 border-r border-gray-700 overflow-y-auto flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Tickets</h2>
          <button
            className="btn btn-outline btn-circle btn-sm"
            onClick={() => setShowAddTicket(true)}
          >
            +
          </button>
        </div>

        <div className="flex-1 p-6">
          {tickets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-300">No tickets found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onClick={() => handleTicketClick(ticket)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Claudes */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Claudes</h2>
        {claudes.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-white">No Claudes Found</h3>
            <p className="text-gray-300 mb-4">No Claudes are currently configured.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {claudes.map((claude) => (
              <ClaudeCard
                key={claude.id}
                claude={claude}
                onClick={() => handleClaudeClick(claude)}
                onAssignTicket={(ticketId) => handleTicketAssignment(ticketId, claude.name)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Terminal Modal */}
      {selectedClaude && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[rgb(38,38,36)] rounded-lg w-full max-w-4xl h-3/4 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedClaude.name}</h2>
                <p className="text-gray-300">{selectedClaude.title}</p>
                <p className="text-xs font-mono text-gray-400 truncate mt-1">{selectedClaude.directory}</p>
              </div>
              <button className="btn btn-circle btn-sm" onClick={handleCloseTerminal}>
                ✕
              </button>
            </div>
            <div className="flex-grow p-4 overflow-hidden">
              <Terminal claudeId={selectedClaude.id} />
            </div>
          </div>
        </div>
      )}

      {/* Add Ticket Modal */}
      {showAddTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[rgb(38,38,36)] rounded-lg w-full max-w-lg">
            <AddTicketForm
              onClose={() => setShowAddTicket(false)}
              onAdd={() => {
                loadData();
                setShowAddTicket(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;