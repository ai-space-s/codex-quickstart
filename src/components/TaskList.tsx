import { TaskItem } from './TaskItem';
import { useTasks, selectVisibleTasks } from '../store/useTasks';
import type { Dictionary } from '../i18n/en';

interface TaskListProps {
  dictionary: Dictionary;
}

export function TaskList({ dictionary }: TaskListProps) {
  const tasks = useTasks(selectVisibleTasks);

  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl bg-slate-800/50 p-6 text-center text-slate-300 shadow-lg">
        {dictionary.empty}
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-4" aria-live="polite">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} dictionary={dictionary} />
      ))}
    </ul>
  );
}
