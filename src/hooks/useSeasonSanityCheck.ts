import { useAppSelector } from '../store/hooks';

export interface SeasonSanityStatus {
  isValid: boolean;
  error?: string;
  phase?: string;
}

export const useSeasonSanityCheck = (): SeasonSanityStatus => {
  const season = useAppSelector((state) => state.season);
  const league = useAppSelector((state) => state.league);

  // Check if league data is loaded
  if (!league.teams || league.teams.length === 0) {
    return {
      isValid: false,
      error: "League data not loaded (0 teams found). Please refresh or reset.",
      phase: season.phase
    };
  }

  // Check Regular Season Logic
  if (season.phase === 'REGULAR') {
    if (!season.scheduleByWeek || season.scheduleByWeek.length === 0) {
      return {
        isValid: false,
        error: "Season phase is REGULAR but no schedule exists.",
        phase: season.phase
      };
    }

    if (season.currentWeekIndex > season.scheduleByWeek.length) {
       return {
         isValid: false,
         error: `Current week index (${season.currentWeekIndex}) exceeds schedule length (${season.scheduleByWeek.length}).`,
         phase: season.phase
       };
    }
  }

  // Check Playoff Logic
  if (season.phase === 'PLAYOFF') {
      if (!season.playoffs) {
          return {
            isValid: false,
            error: "Season phase is PLAYOFF but playoff state is missing.",
            phase: season.phase
          };
      }
  }

  return { isValid: true, phase: season.phase };
};
