import { Recruit, RecruitingPitch, TeamId } from '../types/sim';
import { makeRng } from './rng';

export interface RecruitingWeekResult {
  interestByRecruitId: Record<string, number>;
  committedTeamByRecruitId: Record<string, TeamId | null>;
}

function getGradeMultiplier(grade?: string): number {
  if (!grade) return 1.0;
  if (grade === 'A+') return 1.5;
  if (grade === 'A') return 1.35;
  if (grade === 'B') return 1.2;
  if (grade === 'C') return 1.0;
  if (grade === 'D') return 0.8;
  if (grade === 'F') return 0.5;
  return 1.0;
}

function getImportanceMultiplier(importance?: 'HIGH' | 'MEDIUM' | 'LOW'): number {
  if (importance === 'HIGH') return 1.5;
  if (importance === 'MEDIUM') return 1.25;
  if (importance === 'LOW') return 1.0;
  return 0.7; // Pitching something they don't care about
}

export function simulateRecruitingWeek(
  recruits: Recruit[],
  boardRecruitIds: string[],
  weeklyHoursByRecruitId: Record<string, number>,
  activePitchesByRecruitId: Record<string, RecruitingPitch | undefined>,
  pitchGradesByRecruitId: Record<string, string>,
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
    const activePitch = activePitchesByRecruitId[recruit.id];
    const pitchGrade = pitchGradesByRecruitId[recruit.id];

    let weeklyGain = 0;

    if (hours > 0) {
      const baseGain = hours * 1.5 + recruit.stars * 0.8 + (rng() * 4 - 2);

      let pitchBonus = 0;
      if (activePitch) {
        const motivation = recruit.motivations.find(m => m.pitch === activePitch);
        const importanceMult = getImportanceMultiplier(motivation?.importance);
        const gradeMult = getGradeMultiplier(pitchGrade);

        // Bonus is applied to a portion of the base gain or as additive
        pitchBonus = (baseGain * 0.5) * (importanceMult * gradeMult - 1);
      }

      weeklyGain = Math.max(0, Math.round(baseGain + pitchBonus));
    }

    const decay = boardSet.has(recruit.id) ? 0 : 2;
    const nextInterest = Math.max(0, Math.min(100, prevInterest + weeklyGain - decay));

    let committedTeamId: TeamId | null = recruit.committedTeamId;
    if (!committedTeamId && selectedTeamId && nextInterest >= 100) {
      committedTeamId = selectedTeamId;
    }

    interestByRecruitId[recruit.id] = nextInterest;
    committedTeamByRecruitId[recruit.id] = committedTeamId;
  });

  return { interestByRecruitId, committedTeamByRecruitId };
}
