# DSA Tracker

A client-side React + Vite DSA problem tracker with local progress persistence, filtering, notes, revision flags, stars, dataset import/export, and full-backup restore.

## Current dataset

- 450 problems
- 14 curriculum levels
- 24 categories
- Easy: 126
- Medium: 228
- Hard: 96
- No duplicate problem IDs
- Dataset passes schema/roadmap validation

## Development

```bash
npm install
npm run dev
```

## Verification

```bash
npm test
npm run build
```

`npm test` uses Node's built-in test runner and does not require a separate test framework. It validates the bundled dataset, roadmap integrity, import/merge behavior, filtering, and tracker statistics.

## Data model

All progress is stored in browser `localStorage`. There is no backend or account system. Use **Data Settings → Export Full Backup** to create a portable backup of the dataset and progress.

## PWA / offline mode

The production build includes a web app manifest and service worker. After the first successful online load, the application shell and built assets can be reused offline. Progress remains local-first through browser `localStorage`.

For deployment, serve the production `dist/` directory over HTTPS (or `localhost` during development). The service worker is registered only in production builds.
