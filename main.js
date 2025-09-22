const STORAGE_KEY = 'focusflow.tasks.v1';
const THEME_KEY = 'focusflow.theme';

const form = document.getElementById('task-form');
const titleInput = document.getElementById('task-title');
const descriptionInput = document.getElementById('task-description');
const dueInput = document.getElementById('task-due');
const prioritySelect = document.getElementById('task-priority');
const cancelEditButton = document.getElementById('cancel-edit');
const submitButton = document.getElementById('submit-button');
const taskList = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const statsTotal = document.getElementById('stats-total');
const statsCompleted = document.getElementById('stats-completed');
const progressBar = document.getElementById('progress-bar');
const searchInput = document.getElementById('search-input');
const statusFilter = document.getElementById('status-filter');
const priorityFilter = document.getElementById('priority-filter');
const scheduleFilter = document.getElementById('schedule-filter');
const sortSelect = document.getElementById('sort-select');
const clearCompletedButton = document.getElementById('clear-completed');
const completeAllButton = document.getElementById('complete-all');
const exportButton = document.getElementById('export-button');
const exportDialog = document.getElementById('export-dialog');
const exportText = document.getElementById('export-text');
const copyExportButton = document.getElementById('copy-export');
const themeToggle = document.getElementById('theme-toggle');
const themeToggleIcon = themeToggle.querySelector('.theme-toggle__icon');

const state = {
  tasks: loadTasks(),
  editingId: null,
  filters: {
    search: '',
    status: 'all',
    priority: 'all',
    schedule: 'all',
    sort: 'created',
  },
};

const PRIORITY_ORDER = {
  high: 0,
  medium: 1,
  low: 2,
};

const formatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  weekday: 'short',
});

function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((task) => ({
      ...task,
      createdAt: task.createdAt || new Date().toISOString(),
    }));
  } catch (error) {
    console.warn('Failed to parse saved tasks', error);
    return [];
  }
}

function persistTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
  } catch (error) {
    console.warn('Unable to persist tasks', error);
  }
}

function loadTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'dark' || stored === 'light') {
    applyTheme(stored);
    return;
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(prefersDark ? 'dark' : 'light');
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  themeToggleIcon.textContent = theme === 'dark' ? '🌙' : '🌞';
  themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(current === 'light' ? 'dark' : 'light');
}

function createTask(data) {
  const task = {
    id: generateId(),
    title: data.title.trim(),
    description: data.description.trim(),
    dueDate: data.dueDate ? data.dueDate : null,
    priority: data.priority,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  state.tasks = [task, ...state.tasks];
  persistTasks();
  announce(`Added "${task.title}" to your plan.`);
  render();
}

function updateTask(id, changes) {
  state.tasks = state.tasks.map((task) =>
    task.id === id
      ? {
          ...task,
          ...changes,
        }
      : task
  );
  persistTasks();
  render();
}

function deleteTask(id) {
  const task = state.tasks.find((item) => item.id === id);
  state.tasks = state.tasks.filter((task) => task.id !== id);
  persistTasks();
  if (task) {
    announce(`Removed "${task.title}" from the list.`);
  }
  render();
}

function announce(message) {
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('role', 'status');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.className = 'sr-only';
  liveRegion.textContent = message;
  document.body.appendChild(liveRegion);
  requestAnimationFrame(() => {
    document.body.removeChild(liveRegion);
  });
}

function resetForm() {
  state.editingId = null;
  submitButton.textContent = 'Add task';
  cancelEditButton.hidden = true;
  form.reset();
  titleInput.focus();
}

function beginEdit(task) {
  state.editingId = task.id;
  titleInput.value = task.title;
  descriptionInput.value = task.description;
  dueInput.value = task.dueDate ?? '';
  prioritySelect.value = task.priority;
  submitButton.textContent = 'Save changes';
  cancelEditButton.hidden = false;
  titleInput.focus();
  announce(`Editing "${task.title}"`);
}

function isOverdue(task) {
  if (!task.dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(task.dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today && !task.completed;
}

function isDueToday(task) {
  if (!task.dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(task.dueDate);
  due.setHours(0, 0, 0, 0);
  return due.getTime() === today.getTime();
}

function isUpcoming(task) {
  if (!task.dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(task.dueDate);
  due.setHours(0, 0, 0, 0);
  return due > today;
}

function applyFilters(tasks) {
  let filtered = [...tasks];

  const { search, status, priority, schedule } = state.filters;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (task) =>
        task.title.toLowerCase().includes(q) ||
        task.description.toLowerCase().includes(q)
    );
  }

  if (status !== 'all') {
    filtered = filtered.filter((task) =>
      status === 'completed' ? task.completed : !task.completed
    );
  }

  if (priority !== 'all') {
    filtered = filtered.filter((task) => task.priority === priority);
  }

  if (schedule !== 'all') {
    filtered = filtered.filter((task) => {
      switch (schedule) {
        case 'overdue':
          return isOverdue(task);
        case 'today':
          return isDueToday(task);
        case 'upcoming':
          return isUpcoming(task);
        default:
          return true;
      }
    });
  }

  return sortTasks(filtered);
}

function sortTasks(tasks) {
  const { sort } = state.filters;
  const copy = [...tasks];
  switch (sort) {
    case 'due':
      return copy.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return compareCreated(b, a);
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        const diff = new Date(a.dueDate) - new Date(b.dueDate);
        if (diff !== 0) return diff;
        return compareCreated(b, a);
      });
    case 'priority':
      return copy.sort((a, b) => {
        const diff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        if (diff !== 0) return diff;
        return compareCreated(b, a);
      });
    case 'title':
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case 'created':
    default:
      return copy.sort(compareCreated);
  }
}

function compareCreated(a, b) {
  return new Date(b.createdAt) - new Date(a.createdAt);
}

function updateStats(tasks) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  statsTotal.textContent = `${total} ${total === 1 ? 'task' : 'tasks'}`;
  statsCompleted.textContent = `${completed} completed`;
  progressBar.style.width = total === 0 ? '0%' : `${(completed / total) * 100}%`;
}

function render() {
  const filteredTasks = applyFilters(state.tasks);
  taskList.innerHTML = '';

  filteredTasks.forEach((task) => {
    const node = renderTask(task);
    taskList.appendChild(node);
  });

  emptyState.hidden = filteredTasks.length !== 0;
  updateStats(state.tasks);
}

function renderTask(task) {
  const template = document.getElementById('task-template');
  const clone = template.content.firstElementChild.cloneNode(true);
  clone.dataset.id = task.id;

  const toggle = clone.querySelector('.task__toggle');
  toggle.checked = task.completed;

  const content = clone.querySelector('.task__content');
  const titleEl = clone.querySelector('.task__title');
  titleEl.textContent = task.title;

  if (task.completed) {
    clone.classList.add('task--completed');
  }

  const descriptionEl = clone.querySelector('.task__description');
  if (task.description) {
    descriptionEl.textContent = task.description;
    descriptionEl.hidden = false;
  } else {
    descriptionEl.hidden = true;
  }

  const priorityBadge = clone.querySelector('.task__badge--priority');
  priorityBadge.dataset.priority = task.priority;
  priorityBadge.textContent = `${task.priority} priority`;

  const metaList = clone.querySelector('.task__meta');
  metaList.innerHTML = '';

  if (task.dueDate) {
    const dueItem = document.createElement('li');
    dueItem.className = 'task__badge task__badge--due';
    dueItem.textContent = `Due ${formatter.format(new Date(task.dueDate))}`;
    if (isOverdue(task)) {
      dueItem.classList.add('task__badge--overdue');
      dueItem.textContent = `Overdue — ${formatter.format(new Date(task.dueDate))}`;
    } else if (isDueToday(task)) {
      dueItem.textContent = `Due today (${formatter.format(new Date(task.dueDate))})`;
    }
    metaList.appendChild(dueItem);
  }

  const createdItem = document.createElement('li');
  createdItem.className = 'task__badge';
  createdItem.textContent = `Added ${timeAgo(new Date(task.createdAt))}`;
  metaList.appendChild(createdItem);

  if (task.completed) {
    const completedItem = document.createElement('li');
    completedItem.className = 'task__badge task__badge--completed';
    completedItem.textContent = 'Completed';
    metaList.appendChild(completedItem);
  }

  return clone;
}

function timeAgo(date) {
  const now = new Date();
  const diff = now - date;
  const minutes = Math.round(diff / (1000 * 60));
  if (minutes < 1) return 'just now';
  if (minutes === 1) return '1 minute ago';
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.round(minutes / 60);
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  return formatter.format(date);
}

function exportTasks() {
  const lines = state.tasks.map((task, index) => {
    const parts = [`${index + 1}. ${task.title}`];
    parts.push(`Status: ${task.completed ? '✅ Completed' : '⭕ Active'}`);
    parts.push(`Priority: ${task.priority}`);
    if (task.dueDate) {
      parts.push(`Due: ${formatter.format(new Date(task.dueDate))}`);
    }
    parts.push(`Created: ${new Date(task.createdAt).toLocaleString()}`);
    if (task.description) {
      parts.push(`Notes: ${task.description}`);
    }
    return parts.join('\n');
  });

  exportText.value = lines.join('\n\n');
  exportDialog.showModal();
}

async function copyExport() {
  try {
    await navigator.clipboard.writeText(exportText.value);
    const original = copyExportButton.textContent;
    const feedback = copyExportButton.dataset.feedback || 'Copied!';
    copyExportButton.textContent = feedback;
    setTimeout(() => {
      copyExportButton.textContent = original;
    }, 1200);
  } catch (error) {
    console.warn('Clipboard copy failed', error);
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const title = data.get('title').trim();
  if (!title) {
    titleInput.focus();
    return;
  }

  const payload = {
    title,
    description: data.get('description')?.trim() ?? '',
    dueDate: data.get('dueDate') || null,
    priority: data.get('priority') || 'medium',
  };

  if (state.editingId) {
    updateTask(state.editingId, payload);
    announce(`Saved changes to "${payload.title}"`);
  } else {
    createTask(payload);
  }

  resetForm();
});

cancelEditButton.addEventListener('click', (event) => {
  event.preventDefault();
  resetForm();
});

searchInput.addEventListener('input', (event) => {
  state.filters.search = event.target.value;
  render();
});

statusFilter.addEventListener('change', (event) => {
  state.filters.status = event.target.value;
  render();
});

priorityFilter.addEventListener('change', (event) => {
  state.filters.priority = event.target.value;
  render();
});

scheduleFilter.addEventListener('change', (event) => {
  state.filters.schedule = event.target.value;
  render();
});

sortSelect.addEventListener('change', (event) => {
  state.filters.sort = event.target.value;
  render();
});

taskList.addEventListener('click', (event) => {
  const target = event.target;
  const item = target.closest('.task');
  if (!item) return;
  const id = item.dataset.id;
  if (!id) return;

  if (target.matches('.task__delete')) {
    deleteTask(id);
    return;
  }

  if (target.matches('.task__edit')) {
    const task = state.tasks.find((t) => t.id === id);
    if (task) {
      beginEdit(task);
    }
    return;
  }
});

// handle checkbox change due to label click bubbling
taskList.addEventListener('change', (event) => {
  const target = event.target;
  if (!target.matches('.task__toggle')) return;
  const item = target.closest('.task');
  const id = item?.dataset.id;
  if (!id) return;
  updateTask(id, { completed: target.checked });
});

clearCompletedButton.addEventListener('click', () => {
  const completed = state.tasks.filter((task) => task.completed).length;
  if (!completed) return;
  state.tasks = state.tasks.filter((task) => !task.completed);
  persistTasks();
  announce(`Cleared ${completed} completed ${completed === 1 ? 'task' : 'tasks'}.`);
  render();
});

completeAllButton.addEventListener('click', () => {
  const allComplete = state.tasks.every((task) => task.completed);
  state.tasks = state.tasks.map((task) => ({ ...task, completed: !allComplete }));
  persistTasks();
  announce(allComplete ? 'Reset all tasks to active.' : 'Marked every task complete.');
  render();
});

exportButton.addEventListener('click', () => {
  exportTasks();
});

copyExportButton.addEventListener('click', () => {
  copyExport();
});

themeToggle.addEventListener('click', toggleTheme);

exportDialog.addEventListener('cancel', () => {
  exportDialog.close();
});

exportDialog.addEventListener('click', (event) => {
  const rect = exportDialog.getBoundingClientRect();
  const isInDialog =
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom;
  if (!isInDialog) {
    exportDialog.close();
  }
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && state.editingId) {
    resetForm();
  }
});

function init() {
  loadTheme();
  render();
  if (state.tasks.length === 0) {
    titleInput.focus();
  }
}

init();
