import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store/store';
import { Tactics } from '../../types/sim';
import { generateRoster } from '../../sim/generateRoster';
import { GameResult, simulateGame } from '../../sim/matchEngine';

interface ExhibitionState {
  selectedTeamAId: string | null;
  selectedTeamBId: string | null;
  tacticsA: Tactics;
  tacticsB: Tactics;
  seed: number;
  lastResult: GameResult | null;
}

const defaultTactics: Tactics = {
  tempo: 'normal',
  rideClear: 'balanced',
  slideAggression: 'normal',
};

const initialState: ExhibitionState = {
  selectedTeamAId: null,
  selectedTeamBId: null,
  tacticsA: defaultTactics,
  tacticsB: defaultTactics,
  seed: 2026,
  lastResult: null,
};

export const runExhibition = createAsyncThunk<GameResult | null, void, { state: RootState }>(
  'exhibition/runExhibition',
  async (_arg, { getState }) => {
    const state = getState();
    const { selectedTeamAId, selectedTeamBId, tacticsA, tacticsB, seed } = state.exhibition;

    if (!selectedTeamAId || !selectedTeamBId || selectedTeamAId === selectedTeamBId) {
      return null;
    }

    const teamA = state.league.teams.find((team) => team.id === selectedTeamAId);
    const teamB = state.league.teams.find((team) => team.id === selectedTeamBId);

    if (!teamA || !teamB) {
      return null;
    }

    return simulateGame(
      { team: teamA, roster: generateRoster(teamA, 'league-roster-v1') },
      { team: teamB, roster: generateRoster(teamB, 'league-roster-v1') },
      tacticsA,
      tacticsB,
      seed,
    );
  },
);

const exhibitionSlice = createSlice({
  name: 'exhibition',
  initialState,
  reducers: {
    setTeams: (state, action: PayloadAction<{ teamAId: string; teamBId: string }>) => {
      state.selectedTeamAId = action.payload.teamAId;
      state.selectedTeamBId = action.payload.teamBId;
    },
    setTactics: (state, action: PayloadAction<{ team: 'A' | 'B'; tactics: Tactics }>) => {
      if (action.payload.team === 'A') {
        state.tacticsA = action.payload.tactics;
      } else {
        state.tacticsB = action.payload.tactics;
      }
    },
    setSeed: (state, action: PayloadAction<number>) => {
      state.seed = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(runExhibition.fulfilled, (state, action) => {
      state.lastResult = action.payload;
    });
  },
});

export const { setTeams, setTactics, setSeed } = exhibitionSlice.actions;
export const exhibitionReducer = exhibitionSlice.reducer;
