# Bug Hunter — QA Simulation Game

A QA simulation game. Test fictional apps, discover hidden bugs, write reports, and become a Bug Hunter Legend.

## Features

- **Test fictional applications** — a login system, e-commerce store, banking app, and booking flow, each seeded with hidden bugs.
- **Discover and report bugs** — identify severity (critical / high / medium / low), write reproduction steps, and submit reports.
- **100-level progression** with five difficulty bands (Beginner → Elite). Higher levels mean less time, more XP, and fewer free hints.
- **Rank ladder** from QA Intern to Bug Hunter Legend.
- **Achievements** for milestones like finding your first bug, perfect accuracy, speed runs, and hint-free missions.
- **AI Mentor hints** that guide you when stuck (with an XP cost beyond your free allowance).
- **Player dashboard** tracking XP, accuracy, bugs found, and false-positive rate.

## Tech Stack

- React 19 + TypeScript
- Vite 7 (with `vite-plugin-singlefile` for single-file builds)
- Tailwind CSS 4

## Getting Started

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/   # Screens: Home, MissionSelect, TestEnvironment, BugReportForm, Dashboard, etc.
├── game/         # Mission data, app simulators, and difficulty/level scaling
├── utils/        # Shared helpers (e.g. cn)
├── App.tsx       # Game state, scoring, and screen routing
└── types.ts      # Shared types, ranks, difficulty configs, achievements
```

## Author

<br>This is **Saif Al Saad**<br>🎓 BSc in **Software Engineering**<br>🔍 Major in **Software Quality Assurance & Testing**<br>🏫 **Daffodil International University**