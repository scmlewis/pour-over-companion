# Pour-Over Companion (手沖伴侶)

A bilingual (Traditional Chinese / English) Progressive Web App for specialty coffee enthusiasts. Guides you through the entire pour-over brewing workflow — from bean selection to taste evaluation.

## Features

- **Brew Methods** — V60, Chemex, AeroPress, Kalita Wave, Origami with curated recipes
- **Guided Brew Timer** — Step-by-step pour instructions with auto/manual advancement, audio chimes, and haptic feedback
- **Bean Cellar** — Browse preset estate beans or add your own custom entries
- **Taste Evaluation** — Rule-based heuristic engine that analyzes your brew and suggests adjustments
- **Brew History** — Log results and track your brewing journey over time
- **Offline-First** — IndexedDB storage with LocalStorage fallback, works without internet
- **PWA** — Installable on mobile and desktop with stale-while-revalidate caching

## Tech Stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS 4
- Framer Motion (motion)
- Lucide React icons

## Getting Started

**Prerequisites:** Node.js 18+

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

The app runs at `http://localhost:3000`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Type-check with TypeScript |
| `npm run clean` | Remove build artifacts |

## Project Structure

```
src/
├── components/     # 19 React components
├── data/           # Recipes, beans, tips, suggestions (bilingual)
├── utils/          # Audio, haptics, i18n, IndexedDB, evaluations
├── assets/         # Generated coffee images
├── App.tsx         # Root component with view routing
├── types.ts        # TypeScript interfaces
└── main.tsx        # Entry point
```

## License

MIT
