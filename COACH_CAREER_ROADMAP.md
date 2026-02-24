# Coach Career Roadmap (Integrated)

This roadmap defines how the coach career layer grows **on top of** the existing deterministic league engine.

## Guiding Principles
- Keep simulation logic pure in `src/sim/`.
- Keep persistent user progression in `coachSlice` and season outputs in `seasonSlice`.
- Derive views from selectors/UI; avoid storing redundant calculated state.

---

## Player Journey Blueprint (Create Coach → Choose Team → Run Career)

This is the recommended progression for the first-time career experience and the internal feature rollout order.

### Step 1 — Create Coach Profile (Onboarding)
**User flow**
1. Start Career
2. Enter coach identity (name, alma mater, archetype).
3. Select coaching archetype with starter modifiers (Recruiter / Tactician / Developer).
4. Confirm profile and continue to team selection.

**State additions (`coachSlice`)**
- `coachProfile: { name, archetype, almaMater }`
- `careerStartedAtSeason`
- `onboardingStep` (`PROFILE`, `TEAM_SELECT`, `READY`)

**UI deliverables**
- New route: `/career/setup`
- Route guard: if no profile/team, `/career` redirects to setup
- Summary card in Career page header showing coach identity + archetype bonuses

### Step 2 — Choose Program
**User flow**
1. Browse programs by conference/region/prestige.
2. See expected difficulty and resource bands (scholarships, recruiting pull, job security pressure).
3. Lock in team and begin Year 1.

**State additions (`coachSlice`)**
- `selectedTeamId` (already present)
- `programExpectations: { winTarget, rankTarget, securityBaseline }`
- `careerTier` (`REBUILD`, `STABLE`, `CONTENDER`)

**Integration points**
- Read from `leagueSlice` for team metadata (non-persisted source).
- Initialize recruiting board context and scholarships after team lock.

### Step 3 — Career Hub (Weekly Loop Entry)
**User flow**
- Land on Career Dashboard with 3 primary panels:
  - Recruiting board + weekly hours
  - Team performance snapshot (record, conference standing, resume)
  - Upcoming week plan (game + practice focus placeholder)

**Core loop cadence (in-season)**
1. Allocate recruiting hours
2. Set weekly focus (future phase)
3. Sim/play week
4. Resolve recruiting progression + commitments
5. Review outcomes and repeat

### Step 4 — Milestones Through a Season
- **Preseason:** set expectations, initial board, scholarships available
- **Weeks 1–12:** weekly loop and recruiting battles
- **Selection/Playoffs:** outcome pressure impacts job security and prestige
- **Offseason:** signing day → roster turnover → progression summary

### Step 5 — Multi-Year Career Progression
- Track coach record and bowl/playoff/championship history
- Promotions/job offers based on prestige and results
- Program identity arcs (pipeline states, rivalry temperature, coach legacy)

### Definition of done for onboarding track
- A new player can complete **Create Coach → Choose Team → Enter Career Dashboard** in under 2 minutes.
- Career route is guarded; invalid/incomplete setups cannot enter weekly loop pages.
- Setup choices visibly impact at least one system in Year 1 (recruiting pull or expectation pressure).

---

## Phase 1 — Recruiting Foundation (Now)
**Goal:** Let the user act like a head coach by building and managing a recruiting board.

### Scope
- Deterministic recruit generation by seed.
- Recruit board management (add/remove prospects).
- Weekly recruiting hours allocation with cap.
- Team fit/intelligence signals for decision making.

### Integration points
- `src/sim/recruiting.ts`
  - `generateRecruitPool(seed)`
  - `estimateRecruitFit(recruit, team)`
- `src/features/coach/coachSlice.ts`
  - persistent: `recruitPool`, `boardRecruitIds`, `weeklyHoursByRecruitId`, `recruitingSeed`
- `src/pages/CoachCareerPage.tsx`
  - `/career` route + nav access

### Done criteria
- Same seed produces same recruit pool.
- User can manage a board up to cap.
- Hours remain within allowed ranges.

---

## Phase 2 — Recruiting Battles + Commitments
**Goal:** Turn board management into competitive recruiting outcomes.

### Scope
- Add recruit interest accumulation each week.
- Add competing school pressure (CPU teams as background contenders).
- Add verbal commitment triggers and lockouts.

### Integration with season loop
- Add a season action hook (e.g., after `simCurrentWeek`) to run recruiting week progression.
- Keep outputs compact: store only interest totals, leader, and committed team.

### Candidate modules
- `src/sim/recruitingWeek.ts` (pure progression logic)
- `coachSlice` reducers for week advancement
- `seasonSlice` thunk integration point (dispatch coach update after week sim)

### Done criteria
- Simming weeks changes recruiting race state deterministically.
- Commitments occur and are visible in career UI.

---

## Phase 3 — Roster Turnover + Signing Day
**Goal:** Connect recruiting results to roster reality.

### Scope
- Graduation/departure model (lightweight).
- Signing day: committed recruits become incoming class.
- Team talent trend view (before/after class impact).

### Integration with current systems
- Existing roster generation remains pure; add a coach-driven roster modifier layer.
- Keep league base data static; apply user/team overlays for career progression.

### Candidate data additions
- `CoachState`
  - `signedRecruitsByYear`
  - `scholarshipsAvailable`
- `types/sim.ts`
  - small `RecruitCommitment`/`SigningClass` contracts

### Done criteria
- End-of-season to offseason flow updates future roster quality.

---

## Phase 4 — Coach Operations (Practice/Fatigue/Injuries)
**Goal:** Make weekly coach decisions influence simulation output.

### Scope
- Practice focus presets (offense/defense/conditioning/discipline).
- Fatigue/recovery status.
- Lightweight injury risk + availability impact.

### Integration with match/season sim
- Add optional coach modifiers consumed by `simulateGame` input construction.
- Keep match engine pure by passing modifiers, not reading Redux directly.

### Candidate modules
- `src/sim/coachEffects.ts` (pure modifiers)
- `seasonSim` input composition with coach settings

### Done criteria
- Changing coach plans measurably shifts team outcomes over time.

---

## Phase 5 — Program Identity & Career Progression
**Goal:** Add long-horizon career stakes.

### Scope
- Job security score.
- Program prestige drift (based on performance/recruiting).
- Rivalry and media flavor hooks.

### Integration
- Use existing standings/rankings/playoff outcomes as inputs.
- Persist only compact progression stats and event summaries.

### Done criteria
- User can feel career arc beyond one season.

---

## Cross-Cutting Integration Map

### Existing features this roadmap plugs into
- **Season sim (`seasonSlice`)**: recruiting progression tick after week simulation.
- **Rankings/playoffs**: better teams from recruiting/practice improve record/resume naturally.
- **UI shell**: `/career` coexists with `/season`, `/rankings`, `/playoffs`.

### Performance guardrails
- No per-possession recruiting logs.
- Persist only minimal recruiting/career state.
- Derive leaderboards and insights at render-time/selectors.

### Determinism rules
- Recruit pool and weekly progression are seeded.
- Tie-break/random events derive from stable seed formulas (week + recruit + team ids).

---

## Suggested Implementation Order (Next 3 PRs)
1. **PR A:** Recruiting week progression + commitments (Phase 2 core).
2. **PR B:** Signing day + roster turnover overlays (Phase 3 core).
3. **PR C:** Practice/fatigue modifiers wired into weekly sim inputs (Phase 4 starter).
