import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { Task, Filter, SortDir, SortKey } from '../lib/types';
import { load, save } from '../lib/storage';

export type TaskState = {
  tasks: Task[];
  filter: Filter;
  query: string;
  sortKey: SortKey;
  sortDir: SortDir;
  add: (title: string, dueDate?: string | null) => void;
  toggle: (id: string) => void;
  edit: (id: string, title: string) => void;
  remove: (id: string) => void;
  clearCompleted: () => void;
  setFilter: (filter: Filter) => void;
  setQuery: (query: string) => void;
  setSort: (key: SortKey, dir: SortDir) => void;
};

const defaultState = {
  tasks: [] as Task[],
  filter: 'all' as Filter,
  query: '',
  sortKey: 'createdAt' as SortKey,
  sortDir: 'desc' as SortDir,
};

const hydrated = load(defaultState);

export const useTasks = create<TaskState>((set) => ({
  ...defaultState,
  ...hydrated,
  add: (title, dueDate) => {
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }

    const newTask: Task = {
      id: nanoid(),
      title: trimmed,
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    };

    set((state) => ({ tasks: [newTask, ...state.tasks] }));
  },
  toggle: (id) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      ),
    }));
  },
  edit: (id, title) => {
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }

    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, title: trimmed } : task
      ),
    }));
  },
  remove: (id) => {
    set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) }));
  },
  clearCompleted: () => {
    set((state) => ({ tasks: state.tasks.filter((task) => !task.completed) }));
  },
  setFilter: (filter) => set({ filter }),
  setQuery: (query) => set({ query }),
  setSort: (key, dir) => set({ sortKey: key, sortDir: dir }),
}));

export const resetTasksStore = () =>
  useTasks.setState(
    {
      tasks: [],
      filter: 'all',
      query: '',
      sortKey: 'createdAt',
      sortDir: 'desc',
    },
    true
  );

useTasks.subscribe((state) => {
  const snapshot = {
    tasks: state.tasks,
    filter: state.filter,
    query: state.query,
    sortKey: state.sortKey,
    sortDir: state.sortDir,
  };

  save(snapshot);
});

export const selectVisibleTasks = (state: TaskState): Task[] => {
  const { tasks, filter, query, sortKey, sortDir } = state;
  const normalizedQuery = query.trim().toLowerCase();

  const filtered = tasks.filter((task) => {
    if (filter === 'active' && task.completed) return false;
    if (filter === 'completed' && !task.completed) return false;
    if (normalizedQuery && !task.title.toLowerCase().includes(normalizedQuery)) {
      return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const getValue = (task: Task) =>
      sortKey === 'dueDate' ? task.dueDate ?? '' : task.createdAt;

    const aValue = getValue(a);
    const bValue = getValue(b);

    if (!aValue && !bValue) return 0;
    if (!aValue) return 1;
    if (!bValue) return -1;

    if (aValue === bValue) return 0;

    const comparison = aValue < bValue ? -1 : 1;
    return sortDir === 'asc' ? comparison : -comparison;
  });

  return sorted;
};

export const selectCounts = (state: TaskState) => {
  const total = state.tasks.length;
  const active = state.tasks.filter((task) => !task.completed).length;
  const completed = total - active;
  return { total, active, completed };
};
