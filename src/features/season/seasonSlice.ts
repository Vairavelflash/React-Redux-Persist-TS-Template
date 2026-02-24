import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store/store';
import { GameSummary, ScheduledGame, SeasonState, Team, TeamRecord } from '../../types/sim';
import { generateSeasonSchedule } from '../../sim/schedule';
import { buildRecordsFromResults, simulateWeek } from '../../sim/seasonSim';
import { computePlayoffProjection } from '../../sim/rankings';
import { buildPlayoffState, selectPlayoffField, simulatePlayoffRound } from '../../sim/playoffs';

const initialState: SeasonState = {
  phase: 'IDLE',
  year: 2026,
  seasonSeed: 0,
  currentWeekIndex: 0,
  scheduleByWeek: [],
  resultsByWeek: [],
  playoffState: null,
};

const seasonSlice = createSlice({
  name: 'season',
  initialState,
  reducers: {
    startNewSeason: (state, action: PayloadAction<{ seed: number }>) => {
      state.phase = 'REGULAR';
      state.seasonSeed = action.payload.seed;
      state.currentWeekIndex = 0;
      state.resultsByWeek = [];
      state.playoffState = null;
    },
    setSchedule: (state, action: PayloadAction<ScheduledGame[][]>) => {
      state.scheduleByWeek = action.payload;
      state.resultsByWeek = action.payload.map(() => []);
    },
    setWeekResults: (state, action: PayloadAction<{ weekIndex: number; results: GameSummary[] }>) => {
      state.resultsByWeek[action.payload.weekIndex] = action.payload.results;
      state.currentWeekIndex = action.payload.weekIndex + 1;
      if (state.currentWeekIndex >= 12) {
        state.phase = 'PLAYOFF';
      }
    },
    setCurrentWeek: (state, action: PayloadAction<number>) => {
      state.currentWeekIndex = action.payload;
    },
    setPlayoffState: (state, action: PayloadAction<SeasonState['playoffState']>) => {
      state.playoffState = action.payload;
      if (action.payload?.championTeamId) {
        state.phase = 'COMPLETE';
      }
    },
    resetSeason: () => initialState,
  },
});

export const { setCurrentWeek, resetSeason } = seasonSlice.actions;
export const seasonReducer = seasonSlice.reducer;

// --- Thunk-like dispatchers (synchronous, using getState) ---

export const startNewSeason =
  (payload: { seed: number }) =>
  (dispatch: (action: unknown) => void, getState: () => RootState) => {
    const state = getState();
    const { teams, conferences } = state.league;
    const schedule = generateSeasonSchedule(teams, conferences, payload.seed);
    dispatch(seasonSlice.actions.startNewSeason(payload));
    dispatch(seasonSlice.actions.setSchedule(schedule));
  };

export const simCurrentWeek =
  () => (dispatch: (action: unknown) => void, getState: () => RootState) => {
    const state = getState();
    const { currentWeekIndex, scheduleByWeek, seasonSeed } = state.season;
    if (currentWeekIndex >= 12 || scheduleByWeek.length === 0) return;

    const weekGames = scheduleByWeek[currentWeekIndex];
    const results = simulateWeek(
      weekGames,
      { teams: state.league.teams, conferences: state.league.conferences, rosterSeed: 'league-roster-v1' },
      currentWeekIndex,
      seasonSeed,
    );
    dispatch(seasonSlice.actions.setWeekResults({ weekIndex: currentWeekIndex, results }));
  };

export const simSeason =
  () => (dispatch: (action: unknown) => void, getState: () => RootState) => {
    let state = getState();
    while (state.season.currentWeekIndex < 12 && state.season.scheduleByWeek.length > 0) {
      const { currentWeekIndex, scheduleByWeek, seasonSeed } = state.season;
      const weekGames = scheduleByWeek[currentWeekIndex];
      const results = simulateWeek(
        weekGames,
        { teams: state.league.teams, conferences: state.league.conferences, rosterSeed: 'league-roster-v1' },
        currentWeekIndex,
        seasonSeed,
      );
      dispatch(seasonSlice.actions.setWeekResults({ weekIndex: currentWeekIndex, results }));
      state = getState();
    }
  };

export const startPlayoffs =
  () => (dispatch: (action: unknown) => void, getState: () => RootState) => {
    const state = getState();
    const { resultsByWeek } = state.season;
    const { teams } = state.league;
    const confMap = Object.fromEntries(teams.map((t) => [t.id, t.conferenceId]));
    const records = buildRecordsFromResults(teams, resultsByWeek, confMap);
    const top12 = computePlayoffProjection(teams, records);
    const seeds = selectPlayoffField(top12);
    const playoffState = buildPlayoffState(seeds);
    dispatch(seasonSlice.actions.setPlayoffState(playoffState));
  };

export const simNextPlayoffRound =
  () => (dispatch: (action: unknown) => void, getState: () => RootState) => {
    const state = getState();
    const { playoffState, seasonSeed } = state.season;
    if (!playoffState) return;
    const next = simulatePlayoffRound(playoffState, state.league.teams, seasonSeed + 9000);
    dispatch(seasonSlice.actions.setPlayoffState(next));
  };

// --- Selectors ---

export const selectSeasonHasStarted = (state: RootState) => state.season.phase !== 'IDLE';

export const selectSeasonSummary = (state: RootState) => {
  const s = state.season;
  const completedWeeks = s.resultsByWeek.filter((w) => w.length > 0).length;
  return {
    phase: s.phase,
    currentWeekIndex: s.currentWeekIndex,
    completedWeeks,
    seasonSeed: s.seasonSeed,
  };
};

export const selectWeekGames = (weekIndex: number) =>
  createSelector(
    [(state: RootState) => state.season.scheduleByWeek, (state: RootState) => state.season.resultsByWeek],
    (scheduleByWeek, resultsByWeek): { game: ScheduledGame; result: GameSummary | undefined }[] => {
      const games = scheduleByWeek[weekIndex];
      if (!games) return [];
      const results = resultsByWeek[weekIndex] ?? [];
      const resultById = new Map(results.map((r) => [r.id, r]));
      return games.map((game) => ({ game, result: resultById.get(game.id) }));
    },
  );

export const selectPlayoffState = (state: RootState) => state.season.playoffState;

const selectRecords = createSelector(
  [(state: RootState) => state.league.teams, (state: RootState) => state.season.resultsByWeek],
  (teams, resultsByWeek): Record<string, TeamRecord> => {
    const confMap = Object.fromEntries(teams.map((t) => [t.id, t.conferenceId]));
    return buildRecordsFromResults(teams, resultsByWeek, confMap);
  },
);

export const selectOverallStandings = createSelector(
  [(state: RootState) => state.league.teams, selectRecords],
  (teams: Team[], records: Record<string, TeamRecord>) =>
    teams
      .map((team) => {
        const record = records[team.id] ?? { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0 };
        return { team, record, pointDiff: record.pointsFor - record.pointsAgainst };
      })
      .sort((a, b) => {
        const winDiff = b.record.wins - a.record.wins;
        if (winDiff !== 0) return winDiff;
        return b.pointDiff - a.pointDiff;
      }),
);

export const selectConferenceStandings = (conferenceId: string) =>
  createSelector([selectOverallStandings], (overall) =>
    overall.filter((row) => row.team.conferenceId === conferenceId),
  );
