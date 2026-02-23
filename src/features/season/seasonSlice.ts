import { createAsyncThunk, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store/store';
import { GameSummary, PlayoffState, RankingRow, SeasonState, TeamRecord } from '../../types/sim';
import { generateSeasonSchedule } from '../../sim/schedule';
import { simulateSeasonFrom, simulateWeek } from '../../sim/seasonSim';
import { computePlayoffProjection, computeRankings } from '../../sim/rankings';
import { buildPlayoffState, selectPlayoffField, simulatePlayoffRound } from '../../sim/playoffs';

const blankSeasonState = (): SeasonState => ({
  seasonSeed: 2026,
  currentWeekIndex: 0,
  scheduleByWeek: [],
  resultsByWeek: [],
  recordsByTeamId: {},
  phase: 'REGULAR',
  playoffState: null,
});

const initialState: SeasonState = blankSeasonState();

export const startNewSeason = createAsyncThunk<
  Pick<SeasonState, 'seasonSeed' | 'currentWeekIndex' | 'scheduleByWeek' | 'resultsByWeek' | 'recordsByTeamId' | 'phase' | 'playoffState'>,
  { seed: number },
  { state: RootState }
>('season/startNewSeason', async ({ seed }, { getState }) => {
  const state = getState();
  const scheduleByWeek = generateSeasonSchedule(state.league.teams, state.league.conferences, seed);
  const recordsByTeamId = Object.fromEntries(
    state.league.teams.map((team) => [
      team.id,
      { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0 } as TeamRecord,
    ]),
  );

  return {
    seasonSeed: seed,
    currentWeekIndex: 0,
    scheduleByWeek,
    resultsByWeek: Array.from({ length: 12 }, () => [] as GameSummary[]),
    recordsByTeamId,
    phase: 'REGULAR' as const,
    playoffState: null,
  };
});

export const simCurrentWeek = createAsyncThunk<
  { weekIndex: number; results: GameSummary[]; recordsByTeamId: Record<string, TeamRecord>; nextWeekIndex: number; phase: SeasonState['phase'] } | null,
  void,
  { state: RootState }
>('season/simCurrentWeek', async (_arg, { getState }) => {
  const state = getState();
  const season = state.season;

  if (season.phase !== 'REGULAR' || season.scheduleByWeek.length === 0 || season.currentWeekIndex > 11) {
    return null;
  }

  const weekIndex = season.currentWeekIndex;
  if (season.resultsByWeek[weekIndex]?.length > 0) {
    return {
      weekIndex,
      results: season.resultsByWeek[weekIndex],
      recordsByTeamId: season.recordsByTeamId,
      nextWeekIndex: Math.min(12, weekIndex + 1),
      phase: weekIndex >= 11 ? 'PLAYOFF' : 'REGULAR',
    };
  }

  const inputs = { teams: state.league.teams, conferences: state.league.conferences, rosterSeed: 'league-roster-v1' };
  const results = simulateWeek(season.scheduleByWeek[weekIndex], inputs, weekIndex, season.seasonSeed);

  const allResults = season.resultsByWeek.map((weekResults, idx) => (idx === weekIndex ? results : weekResults));
  const { recordsByTeamId } = simulateSeasonFrom(0, season.scheduleByWeek, allResults, inputs, season.seasonSeed);

  return {
    weekIndex,
    results,
    recordsByTeamId,
    nextWeekIndex: Math.min(12, weekIndex + 1),
    phase: weekIndex >= 11 ? 'PLAYOFF' : 'REGULAR',
  };
});

export const simSeason = createAsyncThunk<
  { resultsByWeek: GameSummary[][]; recordsByTeamId: Record<string, TeamRecord>; phase: SeasonState['phase']; currentWeekIndex: number } | null,
  void,
  { state: RootState }
>('season/simSeason', async (_arg, { getState }) => {
  const state = getState();
  const season = state.season;
  if (season.scheduleByWeek.length === 0) return null;

  const inputs = { teams: state.league.teams, conferences: state.league.conferences, rosterSeed: 'league-roster-v1' };

  const { resultsByWeek, recordsByTeamId } = simulateSeasonFrom(
    season.currentWeekIndex,
    season.scheduleByWeek,
    season.resultsByWeek,
    inputs,
    season.seasonSeed,
  );

  return { resultsByWeek, recordsByTeamId, phase: 'PLAYOFF', currentWeekIndex: 12 };
});

export const startPlayoffs = createAsyncThunk<PlayoffState | null, void, { state: RootState }>('season/startPlayoffs', async (_arg, { getState }) => {
  const state = getState();
  const season = state.season;

  if (season.phase !== 'PLAYOFF') return null;
  if (season.playoffState) return season.playoffState;

  const top12 = computePlayoffProjection(state.league.teams, season.recordsByTeamId);
  const seeds = selectPlayoffField(top12);
  return buildPlayoffState(seeds);
});

export const simNextPlayoffRound = createAsyncThunk<PlayoffState | null, void, { state: RootState }>(
  'season/simNextPlayoffRound',
  async (_arg, { getState }) => {
    const state = getState();
    const season = state.season;
    if (season.phase !== 'PLAYOFF' || !season.playoffState) return null;

    const next = simulatePlayoffRound(season.playoffState, state.league.teams, season.seasonSeed + 50000);
    return next;
  },
);

const seasonSlice = createSlice({
  name: 'season',
  initialState,
  reducers: {
    resetSeason: () => blankSeasonState(),
    simToWeek: (state, action: PayloadAction<number>) => {
      state.currentWeekIndex = Math.max(0, Math.min(action.payload, 12));
    },
  },
  extraReducers: (builder) => {
    builder.addCase(startNewSeason.fulfilled, (state, action) => {
      state.seasonSeed = action.payload.seasonSeed;
      state.currentWeekIndex = action.payload.currentWeekIndex;
      state.scheduleByWeek = action.payload.scheduleByWeek;
      state.resultsByWeek = action.payload.resultsByWeek;
      state.recordsByTeamId = action.payload.recordsByTeamId;
      state.phase = action.payload.phase;
      state.playoffState = action.payload.playoffState;
    });

    builder.addCase(simCurrentWeek.fulfilled, (state, action) => {
      if (!action.payload) return;
      state.resultsByWeek[action.payload.weekIndex] = action.payload.results;
      state.recordsByTeamId = action.payload.recordsByTeamId;
      state.currentWeekIndex = action.payload.nextWeekIndex;
      state.phase = action.payload.phase;
    });

    builder.addCase(simSeason.fulfilled, (state, action) => {
      if (!action.payload) return;
      state.resultsByWeek = action.payload.resultsByWeek;
      state.recordsByTeamId = action.payload.recordsByTeamId;
      state.phase = action.payload.phase;
      state.currentWeekIndex = action.payload.currentWeekIndex;
    });

    builder.addCase(startPlayoffs.fulfilled, (state, action) => {
      if (!action.payload) return;
      state.playoffState = action.payload;
    });

    builder.addCase(simNextPlayoffRound.fulfilled, (state, action) => {
      if (!action.payload) return;
      state.playoffState = action.payload;
      if (action.payload.championTeamId) {
        state.phase = 'DONE';
      }
    });
  },
});

export const { resetSeason, simToWeek } = seasonSlice.actions;
export const seasonReducer = seasonSlice.reducer;

export const selectSeasonState = (state: RootState) => state.season;
export const selectSeasonHasStarted = (state: RootState) => state.season.scheduleByWeek.length === 12;

export const selectWeekGames = (weekIndex: number) =>
  createSelector(
    [(state: RootState) => state.season.scheduleByWeek, (state: RootState) => state.season.resultsByWeek],
    (scheduleByWeek, resultsByWeek) => {
      const scheduled = scheduleByWeek[weekIndex] ?? [];
      const results = resultsByWeek[weekIndex] ?? [];
      const resultById = new Map(results.map((result) => [result.id, result]));
      return scheduled.map((game) => ({ game, result: resultById.get(game.id) ?? null }));
    },
  );

const selectRecordsByTeamId = (state: RootState) => state.season.recordsByTeamId;
const selectTeams = (state: RootState) => state.league.teams;

function winPct(wins: number, losses: number): number {
  const total = wins + losses;
  return total > 0 ? wins / total : 0;
}

export const selectOverallStandings = createSelector([selectTeams, selectRecordsByTeamId], (teams, recordsByTeamId) => {
  return [...teams]
    .map((team) => {
      const record = recordsByTeamId[team.id] ?? { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0 };
      return {
        team,
        record,
        overallWinPct: winPct(record.wins, record.losses),
        pointDiff: record.pointsFor - record.pointsAgainst,
      };
    })
    .sort((a, b) => b.overallWinPct - a.overallWinPct || b.pointDiff - a.pointDiff || b.record.pointsFor - a.record.pointsFor);
});

export const selectConferenceStandings = (conferenceId: string) =>
  createSelector([selectTeams, selectRecordsByTeamId], (teams, recordsByTeamId) => {
    return teams
      .filter((team) => team.conferenceId === conferenceId)
      .map((team) => {
        const record = recordsByTeamId[team.id] ?? { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0 };
        const confWinPct = winPct(record.confWins, record.confLosses);
        const overallWinPct = winPct(record.wins, record.losses);
        const pointDiff = Math.max(-30, Math.min(30, record.pointsFor - record.pointsAgainst));

        return { team, record, confWinPct, overallWinPct, pointDiff };
      })
      .sort(
        (a, b) =>
          b.confWinPct - a.confWinPct || b.overallWinPct - a.overallWinPct || b.pointDiff - a.pointDiff || b.record.pointsFor - a.record.pointsFor,
      );
  });

export const selectSeasonSummary = createSelector([selectSeasonState], (season) => ({
  currentWeekIndex: season.currentWeekIndex,
  completedWeeks: season.resultsByWeek.filter((week) => week.length > 0).length,
  totalWeeks: season.scheduleByWeek.length,
  phase: season.phase,
  seasonSeed: season.seasonSeed,
}));

export const selectTop25Rankings = createSelector([selectTeams, selectRecordsByTeamId], (teams, recordsByTeamId): RankingRow[] =>
  computeRankings(teams, recordsByTeamId, 25),
);

export const selectTop12Projection = createSelector([selectTeams, selectRecordsByTeamId], (teams, recordsByTeamId): RankingRow[] =>
  computePlayoffProjection(teams, recordsByTeamId),
);

export const selectPlayoffState = (state: RootState) => state.season.playoffState ?? null;
