import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Tactics } from '../../types/sim';

export interface CoachState {
  selectedTeamId: string | null;
  tactics: Tactics;
}

const initialState: CoachState = {
  selectedTeamId: null,
  tactics: {
    tempo: 'normal',
    rideClear: 'balanced',
    slideAggression: 'normal',
  },
};

const coachSlice = createSlice({
  name: 'coach',
  initialState,
  reducers: {
    setSelectedTeam: (state, action: PayloadAction<string | null>) => {
      state.selectedTeamId = action.payload;
    },
    setTactics: (state, action: PayloadAction<Tactics>) => {
      state.tactics = action.payload;
    },
  },
});

export const { setSelectedTeam, setTactics } = coachSlice.actions;
export const coachReducer = coachSlice.reducer;
