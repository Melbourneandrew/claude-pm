import React, { useState } from 'react';
import { storage } from '../services/storage';

interface AddTicketFormProps {
  onClose: () => void;
  onAdd: () => void;
}

const AddTicketForm: React.FC<AddTicketFormProps> = ({ onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title) {
      alert('Title is required');
      return;
    }

    setLoading(true);

    try {
      storage.createTicket({
        title,
        description,
        assignee
      });
      onAdd();
      onClose();
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Add New Ticket</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Title</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input input-bordered"
            placeholder="Enter ticket title"
            required
          />
        </div>

        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Description</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="textarea textarea-bordered h-24"
            placeholder="Enter ticket description"
          />
        </div>

        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Assignee</span>
          </label>
          <input
            type="text"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            className="input input-bordered"
            placeholder="Enter assignee name"
          />
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="button"
            className="btn btn-ghost mr-2"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTicketForm;