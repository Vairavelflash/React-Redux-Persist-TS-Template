import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../../store/store';
import { simCurrentWeek } from '../season/seasonSlice';
import { advanceRecruitingWeek } from './coachSlice';

export const runCareerWeeklyCycle = createAsyncThunk<'advanced' | 'skipped', void, { state: RootState }>(
  'coach/runCareerWeeklyCycle',
  async (_arg, { dispatch, getState }) => {
    const state = getState();
    const season = state.season;
    const coach = state.coach;

    const canAdvanceRecruiting = coach.recruitPool.length > 0 && coach.boardRecruitIds.length > 0 && Boolean(coach.selectedTeamId);
    const canSimSeasonWeek = season.phase === 'REGULAR' && season.scheduleByWeek.length === 12 && season.currentWeekIndex < 12;

    if (!canAdvanceRecruiting || !canSimSeasonWeek) {
      return 'skipped';
    }

    await dispatch(simCurrentWeek());
    dispatch(advanceRecruitingWeek());
    return 'advanced';
  },
);
