import { ChangeEvent } from 'react';
import { useTasks } from '../store/useTasks';
import type { Dictionary } from '../i18n/en';

interface SearchSortBarProps {
  dictionary: Dictionary;
}

export function SearchSortBar({ dictionary }: SearchSortBarProps) {
  const { query, sortKey, sortDir, setQuery, setSort } = useTasks((state) => ({
    query: state.query,
    sortKey: state.sortKey,
    sortDir: state.sortDir,
    setQuery: state.setQuery,
    setSort: state.setSort,
  }));

  const handleQuery = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleSortKey = (event: ChangeEvent<HTMLSelectElement>) => {
    setSort(event.target.value as typeof sortKey, sortDir);
  };

  const handleSortDir = (event: ChangeEvent<HTMLSelectElement>) => {
    setSort(sortKey, event.target.value as typeof sortDir);
  };

  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-slate-800/60 p-4 shadow-lg sm:flex-row sm:items-center">
      <div className="flex-1">
        <label htmlFor="task-search" className="sr-only">
          {dictionary.searchPlaceholder}
        </label>
        <input
          id="task-search"
          type="search"
          value={query}
          onChange={handleQuery}
          placeholder={dictionary.searchPlaceholder}
          className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-base shadow-inner"
          aria-label={dictionary.searchPlaceholder}
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label htmlFor="sort-key" className="text-sm font-medium text-slate-300">
          {dictionary.sortLabel}
        </label>
        <select
          id="sort-key"
          value={sortKey}
          onChange={handleSortKey}
          className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm"
          aria-label={dictionary.sortLabel}
        >
          <option value="createdAt">{dictionary.sortCreated}</option>
          <option value="dueDate">{dictionary.sortDue}</option>
        </select>
        <label htmlFor="sort-direction" className="sr-only">
          {dictionary.sortDirection}
        </label>
        <select
          id="sort-direction"
          value={sortDir}
          onChange={handleSortDir}
          className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm"
        >
          <option value="asc">{dictionary.sortAsc}</option>
          <option value="desc">{dictionary.sortDesc}</option>
        </select>
      </div>
    </section>
  );
}
