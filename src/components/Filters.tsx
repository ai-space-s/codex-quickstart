import { useTasks } from '../store/useTasks';
import type { Dictionary } from '../i18n/en';
import type { Filter } from '../lib/types';

interface FiltersProps {
  dictionary: Dictionary;
  counts: {
    total: number;
    active: number;
    completed: number;
  };
}

export function Filters({ dictionary, counts }: FiltersProps) {
  const { filter, setFilter } = useTasks((state) => ({
    filter: state.filter,
    setFilter: state.setFilter,
  }));

  const items: Array<{ value: Filter; label: string; count: number }> = [
    { value: 'all', label: dictionary.filters.all, count: counts.total },
    { value: 'active', label: dictionary.filters.active, count: counts.active },
    { value: 'completed', label: dictionary.filters.completed, count: counts.completed },
  ];

  return (
    <nav
      aria-label="Filters"
      className="flex flex-col gap-3 rounded-2xl bg-slate-800/60 p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between"
    >
      <ul className="flex items-center gap-2">
        {items.map((item) => {
          const isActive = filter === item.value;
          return (
            <li key={item.value}>
              <button
                type="button"
                onClick={() => setFilter(item.value)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline-none ${
                  isActive
                    ? 'bg-sky-500 text-slate-900 shadow'
                    : 'bg-slate-900/60 text-slate-200 hover:bg-slate-700'
                }`}
                aria-pressed={isActive}
              >
                {item.label}
                <span className="ml-2 rounded-full bg-slate-900/60 px-2 py-0.5 text-xs font-medium">
                  {item.count}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="flex gap-4 text-sm text-slate-300">
        <span>
          {dictionary.counts.total}: {counts.total}
        </span>
        <span>
          {dictionary.counts.active}: {counts.active}
        </span>
        <span>
          {dictionary.counts.completed}: {counts.completed}
        </span>
      </div>
    </nav>
  );
}
