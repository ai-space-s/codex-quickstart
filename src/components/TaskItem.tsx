import { FormEvent, useEffect, useState } from 'react';
import type { Task } from '../lib/types';
import { useTasks } from '../store/useTasks';
import type { Dictionary } from '../i18n/en';

type TaskItemProps = {
  task: Task;
  dictionary: Dictionary;
};

const formatDate = (value?: string | null) => {
  if (!value) return null;

  const plainDateMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const date = plainDateMatch
    ? new Date(
        Number(plainDateMatch[1]),
        Number(plainDateMatch[2]) - 1,
        Number(plainDateMatch[3])
      )
    : new Date(value);

  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export function TaskItem({ task, dictionary }: TaskItemProps) {
  const { toggle, edit, remove } = useTasks((state) => ({
    toggle: state.toggle,
    edit: state.edit,
    remove: state.remove,
  }));
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);

  useEffect(() => {
    setDraft(task.title);
  }, [task.title]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    edit(task.id, draft);
    setIsEditing(false);
  };

  return (
    <li className="flex flex-col gap-3 rounded-2xl bg-slate-800/50 p-4 shadow-lg transition hover:bg-slate-800/70">
      <div className="flex items-start gap-3">
        <input
          id={`task-${task.id}`}
          type="checkbox"
          checked={task.completed}
          onChange={() => toggle(task.id)}
          className="mt-1 h-5 w-5 rounded border border-slate-600 bg-slate-900/80"
          aria-label={task.title}
        />
        <div className="flex-1">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
              <label htmlFor={`edit-${task.id}`} className="sr-only">
                {task.title}
              </label>
              <input
                id={`edit-${task.id}`}
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2"
                aria-label={task.title}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-sky-400"
                >
                  {dictionary.save}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setDraft(task.title);
                  }}
                  className="rounded-xl bg-slate-700 px-4 py-2 text-sm font-semibold hover:bg-slate-600"
                >
                  {dictionary.cancel}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <label
                htmlFor={`task-${task.id}`}
                className={`text-lg font-medium leading-tight ${
                  task.completed ? 'text-slate-400 line-through' : 'text-slate-100'
                }`}
              >
                {task.title}
              </label>
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
                {task.dueDate && (
                  <span className="rounded-full bg-slate-900/60 px-3 py-1">
                    {formatDate(task.dueDate)}
                  </span>
                )}
                <span className="rounded-full bg-slate-900/60 px-3 py-1">
                  {formatDate(task.createdAt)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      {!isEditing && (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-xl bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-600"
            aria-label={`${dictionary.edit} ${task.title}`}
          >
            {dictionary.edit}
          </button>
          <button
            type="button"
            onClick={() => remove(task.id)}
            className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-rose-400"
            aria-label={`${dictionary.delete} ${task.title}`}
          >
            {dictionary.delete}
          </button>
        </div>
      )}
    </li>
  );
}
