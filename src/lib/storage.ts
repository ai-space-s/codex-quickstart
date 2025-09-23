const KEY = 'ff_tasks_v1';

export function load<T>(fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn('Failed to load tasks from storage', error);
    return fallback;
  }
}

export function save<T>(data: T): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save tasks to storage', error);
  }
}

export { KEY };
