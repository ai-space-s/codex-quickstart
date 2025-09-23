export type Task = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  dueDate?: string | null;
};

export type Filter = 'all' | 'active' | 'completed';

export type SortKey = 'createdAt' | 'dueDate';

export type SortDir = 'asc' | 'desc';
