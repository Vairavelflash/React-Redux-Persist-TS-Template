# College Lacrosse Head Coach Sim — Roadmap

## A) Project Vision
Build a deterministic, web-based college lacrosse coaching sim with NCAA-ish realism and fully fictionalized schools/branding. Core targets are a 128-team universe (16x8), a 12-game regular season, weekly Top 25 + Top 12 projections, and a 12-team playoff format (1–4 byes, fixed bracket rounds).

---

## B) Current Status

### Implemented
- [x] 128-team league dataset with 16 conferences in JSON.
- [x] Conference/team browsing pages and routing.
- [x] Deterministic roster generation (seeded).
- [x] Deterministic exhibition mode (team selection, tactics, seed, sim output).
- [x] Regular-season schedule generation (12 weeks, 64 games/week).
- [x] Weekly season simulation + season simulation flow.
- [x] Standings pages (conference + overall) and week game views.
- [x] Redux persistence configured for season + coach slices only.

### Partially Implemented
- [ ] Season progression and postseason flow are playable, but balancing and presentation still need polish.
- [ ] Week/game detail depth is compact; no rich drill-down UX yet.
- [ ] Coach career systems are scaffolded but need deeper gameplay impact.

### Not Started
- [ ] Top 25 ranking engine and Top 12 playoff projection.
- [ ] Playoff selection and bracket rounds.
- [ ] Recruiting + offseason systems.
- [ ] Deeper coach management systems (fatigue, injuries, practice planning).
- [ ] Narrative/flavor systems (news, rivalries, job security).

---

## C) Alpha Stage Focus (Current)

### Alpha Definition (this repo)
An **alpha-ready** build means users can run a full deterministic year loop (regular season + playoff bracket), inspect outcomes clearly, and continue a coach save with stable persistence and acceptable UX.

### Alpha Progress Snapshot
- **Complete**: League foundation, team browsing, deterministic roster summaries, deterministic exhibition sim.
- **Complete**: 12-week schedule, week-by-week simulation, standings, and season persistence.
- **In progress**: Ranking and playoff logic tuning + transparency.
- **In progress**: Coach-career depth and progression loop quality.
- **Next up**: UX/accessibility polish, responsive tables, and stronger regression testing.

### Alpha Exit Checklist
- [ ] Rankings criteria are documented and explainable in UI.
- [ ] Playoff flow is fully deterministic and validated end-to-end.
- [ ] Week/game detail pages provide enough depth to understand results.
- [ ] Core loops pass regression tests (schedule, sim, rankings, playoffs).
- [ ] UI is usable on common desktop + tablet viewports.

---

## D) Milestones

## M1 — League Data + Browsing UI
- [x] Add 128 teams and 16 conferences.
- [x] Add Conferences and Team pages.
- [x] Show roster quality summaries.

**Key files/modules**
- `src/data/teams128.json`
- `src/features/league/leagueSlice.ts`
- `src/pages/ConferencesPage.tsx`
- `src/pages/TeamPage.tsx`
- `src/sim/generateRoster.ts`

**Definition of Done**
- 16 conference groups render with 8 teams each.
- Team detail page loads and includes deterministic roster summary.

**Nice-to-haves**
- Conference filters/search.
- Team comparison page.

## M2 — Exhibition Game + Match Engine
- [x] Seeded match simulation with tactics inputs.
- [x] Final score + team box stats + top players + highlights.

**Key files/modules**
- `src/sim/rng.ts`
- `src/sim/matchEngine.ts`
- `src/features/exhibition/exhibitionSlice.ts`
- `src/pages/ExhibitionPage.tsx`

**Definition of Done**
- Same teams+tactics+seed => identical output.
- Sim is effectively instant in UI.

**Nice-to-haves**
- Overtime handling.
- More event variety and richer player stat lines.

## M3 — Season Schedule + Sim Week + Standings
- [x] Generate full 12-week schedule.
- [x] Sim current week and full season.
- [x] Store compact game summaries and team records.
- [x] Week view and standings pages.

**Key files/modules**
- `src/sim/schedule.ts`
- `src/sim/seasonSim.ts`
- `src/features/season/seasonSlice.ts`
- `src/pages/SeasonPage.tsx`
- `src/pages/SeasonWeekPage.tsx`
- `src/pages/SeasonStandingsPage.tsx`

**Definition of Done**
- 12 weeks, 64 games/week, one game per team/week, no duplicate matchups.
- Sim advances and standings update correctly.
- Refresh restores season progress.

**Nice-to-haves**
- Head-to-head tie-breakers.
- Better schedule balancing heuristics.

## M4 — Rankings (Top 25 + Top 12 Projection)
- [x] Compute weekly Top 25 rankings.
- [x] Compute Top 12 playoff projection.
- [x] Replace rankings placeholder page.

**Key files/modules**
- `src/sim/rankings.ts` (planned)
- `src/features/season/seasonSlice.ts` (selectors/derived ranking state)
- `src/pages/RankingsPage.tsx`

**Definition of Done**
- Rankings update after each simulated week.
- Rankings are deterministic for a fixed seed and game results.

**Nice-to-haves**
- Strength-of-schedule and quality-win metrics.
- “Next four out” bubble list.

## M5 — 12-Team Playoff Bracket
- [x] Selection Sunday-style seeding flow.
- [x] Seed 1–4 byes.
- [x] Round 1 pairings: 5v12, 6v11, 7v10, 8v9.
- [x] Fixed bracket advancement until champion.

**Key files/modules**
- `src/sim/rankings.ts` / `src/sim/playoffs.ts` (planned)
- `src/features/season/seasonSlice.ts`
- `src/pages/PlayoffBracketPage.tsx` (planned)

**Definition of Done**
- Bracket generated from final regular-season projection/selection.
- Each round simulates and persists results.

**Nice-to-haves**
- Home-field logic.
- Upset probability overlays.

## M6 — Coach Layer (practice/fatigue/injuries)
- [ ] Team-level practice plan choices.
- [ ] Player/team fatigue and recovery.
- [ ] Injury events and availability effects.

**Key files/modules**
- `src/features/coach/coachSlice.ts`
- `src/sim/matchEngine.ts`
- `src/sim/seasonSim.ts`

**Definition of Done**
- Coach choices have measurable sim impact.
- State persists and is visible in UI.

**Nice-to-haves**
- Training focus per position group.
- Medical staff quality modifiers.

## M7 — Recruiting + Offseason
- [ ] Recruit generation and board management.
- [ ] Signing/commitment flow.
- [ ] Graduation/roster turnover progression.

**Key files/modules**
- `src/data/recruits*.json` (planned)
- `src/features/recruiting/*` (planned)
- `src/sim/offseason.ts` (planned)

**Definition of Done**
- Offseason advances to next season with updated rosters.
- Recruiting outcomes are deterministic and reproducible with seed.

**Nice-to-haves**
- Transfer portal.
- Recruiting pipeline geography effects.

## M8 — Flavor Systems
- [ ] News feed and weekly storylines.
- [ ] Rivalry game tagging.
- [ ] Job security/coach reputation loops.
- [ ] Program upgrade systems.

**Key files/modules**
- `src/features/ui/*`
- `src/features/coach/*`
- `src/pages/*` (news/profile pages planned)

**Definition of Done**
- Flavor systems read real season data and update each week.

**Nice-to-haves**
- Dynamic rivalry trophies.
- Press conference text flavor.

## M9 — Polish
- [ ] Accessibility pass (keyboard, semantics, contrast).
- [ ] Mobile responsiveness and compact tables.
- [ ] Settings panel for sim speed/detail.
- [ ] Performance hardening for 128-team workflows.

**Key files/modules**
- `src/pages/style.css`
- page components under `src/pages/`
- selectors in feature slices

**Definition of Done**
- Smooth UX on common viewport sizes.
- No noticeable lag across week sim/standings/rankings pages.

**Nice-to-haves**
- Virtualized long lists.
- Theme toggle.

---

## E) Data Contracts

### `teams128.json` schema (current)
```json
{
  "conferences": [{ "id": "string", "name": "string" }],
  "teams": [
    {
      "id": "string",
      "schoolName": "string",
      "nickname": "string",
      "conferenceId": "string",
      "region": "string",
      "prestige": 1
    }
  ]
}
```

### Recruits schema (planned)
```json
{
  "recruits": [
    {
      "id": "string",
      "name": "string",
      "position": "A|M|D|LSM|FO|G",
      "stars": 2,
      "region": "string",
      "interestByTeamId": { "teamId": 0.5 }
    }
  ]
}
```

### `GameSummary` minimal shape (current TS contract)
```ts
{
  id: string;
  weekIndex: number;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  teamStatsHome: { goals, shots, saves, turnovers, groundBalls, penalties, faceoffPct };
  teamStatsAway: { goals, shots, saves, turnovers, groundBalls, penalties, faceoffPct };
  topPerformers?: Array<{ playerId, name, teamId, position, goals, assists, saves }>;
}
```

Principle: keep season storage compact; do not persist per-possession logs for all 768 regular-season games.

---

## E) Dev Commands
Use project scripts from `package.json`:

- Install dependencies: `npm install`
- Run dev server: `npm run dev`
- Build production bundle: `npm run build`
- Lint: `npm run lint`
- Preview build: `npm run preview`

---

## F) Code Organization
- `src/sim/`: pure deterministic simulation functions only (no React/Redux imports).
- `src/features/`: Redux slices/selectors/thunks.
- `src/pages/`: route-level UI and views.
- `src/data/`: static JSON data assets.
- `src/types/`: shared TypeScript domain contracts.

Persistence rules:
- Persist: `season`, `coach`
- Do not persist: `league` (reloaded from JSON)

---

## G) Planned UX Pages
- [x] Conferences
- [x] Team
- [x] Exhibition
- [x] Season Dashboard
- [x] Week View
- [x] Standings
- [ ] Rankings (real content)
- [ ] Playoff Bracket
- [ ] Recruiting
- [ ] Settings

---

## H) Risk & Scope Control
- Keep simulation fast enough for instant week sim feedback.
- Avoid storing heavy per-possession logs for every season game.
- Keep expensive computations derived in memoized selectors.
- Validate schedule invariants every new season generation.
- Keep deterministic seed paths stable for debugging and reproducibility.
- Prefer incremental feature layering (rankings -> playoff -> recruiting) to control complexity.
