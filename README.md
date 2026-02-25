# College Lacrosse Head Coach Sim (React + Redux + TS)

A deterministic, web-based college lacrosse head coach simulation built on React, Vite, Redux Toolkit, and TypeScript.

## Current features

- 128-team fictional league (16 conferences x 8 teams).
- Season command center with seeded season starts, week/season sim controls, and standings/rankings/playoff navigation.
- Coach Career onboarding (`/career/setup`) with program selection and recruiting board workflow.
- Unified weekly loop option in Career (`Run Weekly Cycle`) to advance season week + recruiting week together when prerequisites are met.
- Deterministic simulation modules under `src/sim/` (schedule, match engine, rankings, playoffs, recruiting helpers).
- Persisted gameplay/user state via Redux Persist (`season`, `coach`, `ui`) while keeping league data non-persisted.

See roadmap details in [ROADMAP.md](./ROADMAP.md).

## Run the app

```bash
npm install
npm run dev
```

## Build and checks

```bash
npm run lint
npm run build
```

## Scripts

- `npm run dev` — Start Vite development server
- `npm run build` — Type-check + production build
- `npm run lint` — Lint TypeScript/TSX files
- `npm run preview` — Preview production build locally
