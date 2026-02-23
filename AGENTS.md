# College Lacrosse Head Coach Sim — Agent Instructions

## Product goal
Build a deterministic, web-based college lacrosse head coach simulation with:
- 128 teams (16 conferences x 8 teams)
- 12-game regular season (7 conference round robin + 5 non-conference)
- Weekly Top 25 + Top 12 playoff projection
- 12-team playoff bracket (1–4 byes; R1 = 5v12, 6v11, 7v10, 8v9)
- NCAA-ish realism with fully fictionalized branding

## Architecture rules
1. Keep simulation logic pure and isolated under `src/sim/`.
   - No React/Redux imports in simulation modules.
   - Planned core files: `rng.ts`, `matchEngine.ts`, `schedule.ts`, `rankings.ts`.
2. Redux slices live in `src/features/`.
   - `leagueSlice`: static league/team data loaded from JSON at startup; **do not persist**.
   - `seasonSlice`: schedule/results/standings/current week/playoffs; **persist**.
   - `coachSlice`: selected user team, tactics, settings; **persist**.
   - `uiSlice`: optional minimal UI state.
3. Persistence configuration must whitelist only persisted gameplay/user slices.
4. Prefer derived views + memoized selectors for standings/rankings over storing redundant state.

## Current phase focus
For this phase, scaffold architecture and implement league browsing + generated roster summaries.
Do **not** implement full sim engine yet.
