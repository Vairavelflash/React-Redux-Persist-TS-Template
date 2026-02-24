import { Recruit, TeamId } from '../types/sim';
import { makeRng } from './rng';

export interface RecruitingWeekResult {
  interestByRecruitId: Record<string, number>;
  committedTeamByRecruitId: Record<string, TeamId | null>;
}

export function simulateRecruitingWeek(
  recruits: Recruit[],
  boardRecruitIds: string[],
  weeklyHoursByRecruitId: Record<string, number>,
  currentInterestByRecruitId: Record<string, number>,
  selectedTeamId: TeamId | null,
  seed: number,
  weekIndex: number,
): RecruitingWeekResult {
  const rng = makeRng(seed + weekIndex * 9973);
  const boardSet = new Set(boardRecruitIds);

  const interestByRecruitId: Record<string, number> = {};
  const committedTeamByRecruitId: Record<string, TeamId | null> = {};

  recruits.forEach((recruit) => {
    const prevInterest = currentInterestByRecruitId[recruit.id] ?? 0;
    const hours = boardSet.has(recruit.id) ? weeklyHoursByRecruitId[recruit.id] ?? 0 : 0;
    const weeklyGain = Math.max(0, Math.round(hours * 1.8 + recruit.stars * 0.9 + (rng() * 6 - 2)));
    const decay = boardSet.has(recruit.id) ? 0 : 2;
    const nextInterest = Math.max(0, Math.min(100, prevInterest + weeklyGain - decay));

    let committedTeamId: TeamId | null = recruit.committedTeamId;
    if (!committedTeamId && selectedTeamId && nextInterest >= 92) {
      committedTeamId = selectedTeamId;
    }

    interestByRecruitId[recruit.id] = nextInterest;
    committedTeamByRecruitId[recruit.id] = committedTeamId;
  });

  return { interestByRecruitId, committedTeamByRecruitId };
}
