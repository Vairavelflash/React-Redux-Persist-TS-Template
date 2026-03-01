import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../../store/store';
import { simCurrentWeek } from '../season/seasonSlice';
import { advanceCoachWeek, advanceRecruitingWeek } from './coachSlice';

export const runCareerWeeklyCycle = createAsyncThunk<'advanced' | 'skipped', void, { state: RootState }>(
  'coach/runCareerWeeklyCycle',
  async (_arg, { dispatch, getState }) => {
    const state = getState();
    const season = state.season;
    const coach = state.coach;

    const canAdvanceRecruiting = coach.recruitPool.length > 0 && Boolean(coach.selectedTeamId);
    const canSimSeasonWeek = season.phase === 'REGULAR' && season.scheduleByWeek.length === 12 && season.currentWeekIndex < 12;

    if (!canSimSeasonWeek) {
      return 'skipped';
    }

    await dispatch(simCurrentWeek());

    // Recruiting updates are optional; season progression should still work even if
    // the user has no active targets on their board.
    if (canAdvanceRecruiting) {
      await dispatch(advanceRecruitingWeek());
    }

    dispatch(advanceCoachWeek());
    return 'advanced';
  },
);
