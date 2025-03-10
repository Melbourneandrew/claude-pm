import React, { useState, useEffect } from 'react';
import AddTicketForm from '../components/AddTicketForm';
import { Ticket } from '../types';

const TicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [assigneeName, setAssigneeName] = useState('');

  const loadTickets = async () => {
    try {
      setLoading(true);
      const loadedTickets = await window.electron.getTickets();
      setTickets(loadedTickets);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleStatusChange = async (ticketId: string, newStatus: 'open' | 'in_progress' | 'closed') => {
    try {
      await window.electron.updateTicket(ticketId, { status: newStatus });
      loadTickets();
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  const handleAssignTicket = async () => {
    if (!selectedTicket || !assigneeName.trim()) {
      return;
    }

    try {
      await window.electron.assignTicket(selectedTicket.id, assigneeName);
      setSelectedTicket(null);
      setAssigneeName('');
      loadTickets();
    } catch (error) {
      console.error('Error assigning ticket:', error);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'open':
        return 'badge badge-info';
      case 'in_progress':
        return 'badge badge-warning';
      case 'closed':
        return 'badge badge-success';
      default:
        return 'badge';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tickets</h1>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          Add Ticket
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold">No Tickets Found</h3>
          <p className="text-gray-500 mb-4">Create your first ticket to get started.</p>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            Add Your First Ticket
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Title</th>
                <th>Assignee</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>
                    <div>
                      <div className="font-bold">{ticket.title}</div>
                      <div className="text-sm opacity-50">{ticket.description}</div>
                    </div>
                  </td>
                  <td>{ticket.assignee || 'Unassigned'}</td>
                  <td>
                    <span className={getStatusBadgeClass(ticket.status)}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <div className="flex space-x-2">
                      {ticket.status === 'open' && (
                        <button 
                          className="btn btn-xs btn-outline"
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          Assign
                        </button>
                      )}
                      
                      {ticket.status === 'open' && (
                        <button 
                          className="btn btn-xs btn-outline"
                          onClick={() => handleStatusChange(ticket.id, 'in_progress')}
                        >
                          Start
                        </button>
                      )}
                      
                      {ticket.status === 'in_progress' && (
                        <button 
                          className="btn btn-xs btn-outline btn-success"
                          onClick={() => handleStatusChange(ticket.id, 'closed')}
                        >
                          Close
                        </button>
                      )}
                      
                      {ticket.status === 'closed' && (
                        <button 
                          className="btn btn-xs btn-outline"
                          onClick={() => handleStatusChange(ticket.id, 'open')}
                        >
                          Reopen
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Ticket Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md overflow-hidden">
            <AddTicketForm
              onClose={() => setShowAddModal(false)}
              onAdd={loadTickets}
            />
          </div>
        </div>
      )}

      {/* Assign Ticket Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md overflow-hidden p-6">
            <h2 className="text-xl font-bold mb-4">Assign Ticket</h2>
            <p className="mb-4">
              <span className="font-semibold">Ticket:</span> {selectedTicket.title}
            </p>
            
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Assignee Name</span>
              </label>
              <input
                type="text"
                value={assigneeName}
                onChange={(e) => setAssigneeName(e.target.value)}
                className="input input-bordered"
                placeholder="Enter assignee name"
              />
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                type="button"
                className="btn btn-ghost mr-2"
                onClick={() => {
                  setSelectedTicket(null);
                  setAssigneeName('');
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAssignTicket}
                disabled={!assigneeName.trim()}
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketsPage;