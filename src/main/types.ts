export interface Claude {
  id: string;
  name: string;
  title: string;
  directory: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  assignee: string;
  created_at: number;
  status: 'open' | 'in_progress' | 'closed';
}