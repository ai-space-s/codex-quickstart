import { FormEvent, useState } from 'react';
import { useTasks } from '../store/useTasks';
import type { Dictionary } from '../i18n/en';

type TaskInputProps = {
  dictionary: Dictionary;
};

export function TaskInput({ dictionary }: TaskInputProps) {
  const add = useTasks((state) => state.add);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    add(title, dueDate || null);
    setTitle('');
    setDueDate('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl bg-slate-800/80 p-4 shadow-lg sm:flex-row"
    >
      <div className="flex-1">
        <label htmlFor="task-title" className="sr-only">
          {dictionary.inputPlaceholder}
        </label>
        <input
          id="task-title"
          name="title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={dictionary.inputPlaceholder}
          className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-base shadow-inner"
          aria-label={dictionary.inputPlaceholder}
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="sm:w-44">
          <label htmlFor="task-due" className="sr-only">
            {dictionary.dueDateLabel}
          </label>
          <input
            id="task-due"
            name="dueDate"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            aria-label={dictionary.dueDateLabel}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-base shadow-inner"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-slate-900 transition hover:bg-sky-400 focus-visible:outline-none"
          aria-label={dictionary.addButton}
        >
          {dictionary.addButton}
        </button>
      </div>
    </form>
  );
}
