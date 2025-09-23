# Codex Quickstart Tasks

A responsive and accessible to-do dashboard rebuilt with React, Vite, Tailwind CSS, and Zustand. Tasks persist locally and can be filtered, searched, and sorted without losing keyboard accessibility.

## Tech stack

- [React](https://react.dev/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Zustand](https://github.com/pmndrs/zustand) for global state management
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) for tests
- GitHub Pages continuous deployment via GitHub Actions

## Features

- Add, edit, toggle, and delete tasks with optional due dates
- Persist tasks, filters, and search queries via `localStorage`
- Filter by All / Active / Completed, search by title, and sort by created date or due date
- Keyboard-first interactions with visible focus rings and ARIA labels
- English and Korean copy prepared for future i18n expansion

## Accessibility

- Semantic HTML with labeled form controls and live regions
- All actions available via keyboard (Enter/Space) and focus-visible outlines
- Color contrast tuned for dark background with readable typography

## Getting started

```bash
pnpm install
pnpm dev
```

The development server starts at <http://localhost:5173/codex-quickstart/> with hot module replacement enabled.

## Build

```bash
pnpm build
pnpm preview
```

The static bundle is emitted to `dist/` and configured with the `/codex-quickstart/` base path for GitHub Pages.

## Testing & linting

```bash
pnpm test
pnpm lint
pnpm format
```

`pnpm test` runs the Vitest suite with jsdom. Linting relies on ESLint with TypeScript and React Hooks rules, while `pnpm format` checks Prettier formatting.

## Deployment

A GitHub Actions workflow (`.github/workflows/pages.yml`) builds the Vite project and publishes the `dist/` directory to GitHub Pages whenever `main` is updated. Once merged, the site will be available at:

```
https://<your-github-username>.github.io/codex-quickstart/
```

Replace `<your-github-username>` with your GitHub handle after enabling Pages for the repository.
