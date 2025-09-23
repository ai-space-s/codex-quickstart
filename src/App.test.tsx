import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { KEY } from './lib/storage';

const renderApp = async () => {
  const App = (await import('./App')).default;
  return render(<App />);
};

describe('App task flow', () => {
  beforeEach(() => {
    vi.resetModules();
    window.localStorage.clear();
  });

  it('allows adding, toggling, and deleting a task', async () => {
    await renderApp();

    const input = screen.getByLabelText(/What needs to be done/i);
    fireEvent.change(input, { target: { value: 'Test Task' } });

    const addButton = screen.getByRole('button', { name: /Add task/i });
    fireEvent.click(addButton);

    const checkbox = screen.getByRole('checkbox', { name: 'Test Task' });
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    const deleteButton = screen.getByRole('button', { name: 'Delete Test Task' });
    fireEvent.click(deleteButton);

    expect(screen.queryByText('Test Task')).not.toBeInTheDocument();
  });

  it('hydrates tasks from localStorage on load', async () => {
    const storedTask = {
      id: 'stored-1',
      title: 'Stored Task',
      completed: false,
      createdAt: new Date('2024-01-01').toISOString(),
      dueDate: null,
    };

    window.localStorage.setItem(
      KEY,
      JSON.stringify({
        tasks: [storedTask],
        filter: 'all',
        query: '',
        sortKey: 'createdAt',
        sortDir: 'desc',
      })
    );

    await renderApp();

    expect(screen.getByText('Stored Task')).toBeInTheDocument();
  });

  it('displays the entered due date for plain date inputs in a negative offset timezone', async () => {
    const originalTZ = process.env.TZ;

    try {
      process.env.TZ = 'America/Los_Angeles';

      await renderApp();

      const input = screen.getByLabelText(/What needs to be done/i);
      fireEvent.change(input, { target: { value: 'Task with due date' } });

      const dueDateInput = screen.getByLabelText(/Due date/i);
      fireEvent.change(dueDateInput, { target: { value: '2024-04-10' } });

      const addButton = screen.getByRole('button', { name: /Add task/i });
      fireEvent.click(addButton);

      const expectedDueDate = new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(2024, 3, 10));

      expect(screen.getByText('Task with due date')).toBeInTheDocument();
      expect(screen.getByText(expectedDueDate)).toBeInTheDocument();
    } finally {
      if (originalTZ === undefined) {
        delete process.env.TZ;
      } else {
        process.env.TZ = originalTZ;
      }
    }
  });
});
