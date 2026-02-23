import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SeasonState } from '../../types/sim';

const initialState: SeasonState = {
  year: 2026,
  currentWeek: 1,
  gameResults: [],
  isComplete: false,
};

const seasonSlice = createSlice({
  name: 'season',
  initialState,
  reducers: {
    setCurrentWeek: (state, action: PayloadAction<number>) => {
      state.currentWeek = action.payload;
    },
    resetSeason: () => initialState,
  },
});

export const { setCurrentWeek, resetSeason } = seasonSlice.actions;
export const seasonReducer = seasonSlice.reducer;
