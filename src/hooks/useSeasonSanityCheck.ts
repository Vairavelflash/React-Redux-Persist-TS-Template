import { validateSeasonState } from '../sim/seasonValidation';
import { useAppSelector } from '../store/hooks';

export interface SeasonSanityStatus {
  isValid: boolean;
  error?: string;
  phase?: string;
}

export const useSeasonSanityCheck = (): SeasonSanityStatus => {
  const season = useAppSelector((state) => state.season);
  const teams = useAppSelector((state) => state.league.teams);

  return validateSeasonState(season, teams);
};
