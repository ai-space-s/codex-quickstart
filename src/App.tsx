import { en } from './i18n/en';
import { TaskInput } from './components/TaskInput';
import { SearchSortBar } from './components/SearchSortBar';
import { Filters } from './components/Filters';
import { TaskList } from './components/TaskList';
import { selectCounts, useTasks } from './store/useTasks';

const dictionary = en;

function App() {
  const counts = useTasks(selectCounts);
  const clearCompleted = useTasks((state) => state.clearCompleted);
  const hasCompleted = counts.completed > 0;

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-4 py-10">
      <header className="space-y-2 text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-sky-400">codex</p>
        <h1 className="text-3xl font-bold text-slate-50 sm:text-4xl">
          {dictionary.title}
        </h1>
        <p className="text-sm text-slate-300">
          {dictionary.counts.total}: {counts.total} • {dictionary.counts.active}:{' '}
          {counts.active} • {dictionary.counts.completed}: {counts.completed}
        </p>
      </header>
      <TaskInput dictionary={dictionary} />
      <SearchSortBar dictionary={dictionary} />
      <Filters dictionary={dictionary} counts={counts} />
      <TaskList dictionary={dictionary} />
      {hasCompleted && (
        <button
          type="button"
          onClick={clearCompleted}
          className="self-end rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 shadow hover:bg-emerald-400"
          aria-label={dictionary.clearCompleted}
        >
          {dictionary.clearCompleted}
        </button>
      )}
      <footer className="mt-auto text-center text-xs text-slate-500">
        Built with React, Zustand, and Tailwind CSS.
      </footer>
    </div>
  );
}

export default App;
