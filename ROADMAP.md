# College Lacrosse Head Coach Sim — Roadmap (Revamp)

## Vision
Build a deterministic, web-based college lacrosse sim with fictionalized NCAA-ish programs, a 128-team league, full regular season flow, weekly rankings/projections, and a 12-team playoff to crown a champion.

---

## Current Reality Snapshot

### ✅ Implemented now
- [x] 128 teams + 16 conferences loaded from JSON.
- [x] Conference and Team browsing pages.
- [x] Deterministic roster generation.
- [x] Exhibition game sim (seeded) with box score/highlights.
- [x] 12-week regular-season scheduler (64 games/week).
- [x] Week and full-season simulation.
- [x] Standings (conference + overall).
- [x] Rankings page with Top 25 + Top 12 + resume metrics (SOS, quality wins, bad losses, next four out).
- [x] Playoff flow scaffolded into UI and season state (start playoffs, simulate rounds, champion).
- [x] Dark mode toggle and persisted UI preference.

### ⚠️ Functional but still rough
- [ ] Playoff UX is list-style and minimal (not a visual bracket yet).
- [ ] Selection logic is deterministic but simplified (no nuanced committee profile).
- [ ] Week detail exists but still basic (panel, not rich game recap).

### ⏳ Not started
- [~] Recruiting + offseason progression (foundation started; weekly battles/signing day pending).
- [ ] Coach systems (fatigue/injuries/practice impact).
- [ ] Narrative systems (news, rivalries, job security).
- [ ] Full settings/perf/accessibility pass.

---

## Milestone Board (Updated)

## M1 — League Foundation
**Status:** ✅ Done

- [x] Team/conference data model
- [x] League browsing routes
- [x] Team roster summaries

**Key modules**
- `src/data/teams128.json`
- `src/features/league/leagueSlice.ts`
- `src/pages/ConferencesPage.tsx`, `src/pages/TeamPage.tsx`
- `src/sim/generateRoster.ts`

---

## M2 — Match Engine + Exhibition
**Status:** ✅ Done

- [x] Seeded RNG and deterministic game simulation
- [x] Exhibition controls (teams/tactics/seed)
- [x] Team/player stats + highlights output

**Key modules**
- `src/sim/rng.ts`
- `src/sim/matchEngine.ts`
- `src/features/exhibition/exhibitionSlice.ts`
- `src/pages/ExhibitionPage.tsx`

---

## M3 — Regular Season Loop
**Status:** ✅ Done

- [x] Full 12-week schedule generation
- [x] Week + season simulation
- [x] Compact persisted season results/records
- [x] Week view + standings pages

**Key modules**
- `src/sim/schedule.ts`
- `src/sim/seasonSim.ts`
- `src/features/season/seasonSlice.ts`
- `src/pages/SeasonPage.tsx`, `src/pages/SeasonWeekPage.tsx`, `src/pages/SeasonStandingsPage.tsx`

---

## M4 — Rankings + Projection
**Status:** ✅ v1 shipped

- [x] Top 25 rankings
- [x] Top 12 playoff projection
- [x] Resume metrics (SOS/QW/BL)
- [x] Next Four Out

**Remaining enhancements**
- [ ] Better SOS/quality-win model
- [ ] Head-to-head/tiered tiebreak stack
- [ ] Resume explanation UI per team

**Key modules**
- `src/sim/rankings.ts`
- `src/features/season/seasonSlice.ts`
- `src/pages/RankingsPage.tsx`

---

## M5 — 12-Team Playoff
**Status:** ✅ v1 shipped / 🛠️ polish needed

- [x] Seeded field from Top 12 projection
- [x] Round simulation through champion
- [x] Season phase reaches `DONE`

**Remaining enhancements**
- [ ] Bracket visualization component (instead of list blocks)
- [ ] Selection Sunday page/state snapshot
- [ ] Round metadata (venue/home-field) and richer summaries

**Key modules**
- `src/sim/playoffs.ts`
- `src/features/season/seasonSlice.ts`
- `src/pages/PlayoffsPage.tsx`

---

## M6 — Coach Depth
**Status:** 🛠️ Foundation started

- [ ] Practice planning
- [ ] Fatigue/recovery
- [ ] Injury modeling

**Definition of done**
- Coach decisions measurably affect game outputs.

---

## M7 — Recruiting + Offseason
**Status:** 🛠️ Foundation started

- [ ] Recruit generation + board workflows
- [ ] Signing logic
- [ ] Graduation/roster turnover

---

## M8 — Flavor + Immersion
**Status:** ⏳ Not started

- [ ] News feed
- [ ] Rivalry tracking
- [ ] Job security and prestige feedback loops

---

## M9 — Product Polish
**Status:** 🛠️ In progress

- [x] Responsive shell + dark mode
- [ ] Accessibility pass (contrast/keyboard/semantics)
- [ ] Performance pass for large tables/lists
- [ ] Sim settings panel

---

## Coach Career Plan
- See `COACH_CAREER_ROADMAP.md` for phase-by-phase career progression and integration details.

## Next Sprint Decision (What to do next)

### Priority 1 — Season ↔ Career loop integration (in progress)
- [x] Surface coach program snapshot directly in season flow and vice-versa.
- [x] Add clear prompts when either side is incomplete (no season started / no coach setup).
- [~] Trigger recruiting progression from season-week advancement (single action loop; UI combined action added, reducer-level orchestration pending).

### Priority 2 — Recruiting competitiveness polish
- Add lightweight CPU pressure model and signed-elsewhere cadence tuning.
- Improve interest explanation in UI (hours + fit + momentum breakdown).
- Add deterministic weekly story hooks for major commitments.

### Priority 3 — Offseason transition scaffold
- Add Signing Day checkpoint and class summary card.
- Start roster turnover overlays (graduation + incoming class effect).
- Surface Year-in-review and job security deltas.

**Proposed implementation order:**
1. Weekly season-career combined action path
2. Recruiting race clarity and balancing
3. Offseason/signing-day scaffolding

---

## Data Contracts (Current)

### `teams128.json`
```json
{
  "conferences": [{ "id": "string", "name": "string" }],
  "teams": [{ "id": "string", "schoolName": "string", "nickname": "string", "conferenceId": "string", "region": "string", "prestige": 1 }]
}
```

### `GameSummary` (compact)
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

### Playoff state (current)
- Seeds 1–12
- Rounds: `ROUND1`, `QUARTERFINAL`, `SEMIFINAL`, `FINAL`
- Champion ID at completion

---

## Dev Commands
- `npm install`
- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run preview`

---

## Architecture Guardrails
- Keep all simulation logic pure under `src/sim/`.
- Keep league non-persisted (reload from JSON).
- Persist user/game progress slices (`season`, `coach`, `ui`).
- Keep long-term storage compact; derive heavy views via memoized selectors.
