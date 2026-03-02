import type { Recruit, RecruitingPitch, TeamId } from '../types/sim.ts';
import { makeRng } from './rng.ts';

import { randInt } from './rng.ts';

export interface RecruitingWeekResult {
  interestByRecruitId: Record<string, Record<string, number>>; // recruitId -> teamId -> interest
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
  dealbreakerViolationsByRecruitId: Record<string, boolean>,
  selectedTeamId: TeamId | null,
  seed: number,
  weekIndex: number,
  archetypeBonus: number = 1.0,
  coachSkill: number = 72,
): RecruitingWeekResult {
  const rng = makeRng(seed + weekIndex * 9973);
  const boardSet = new Set(boardRecruitIds);

  const interestByRecruitId: Record<string, Record<string, number>> = {};
  const committedTeamByRecruitId: Record<string, TeamId | null> = {};

  recruits.forEach((recruit) => {
    // If already committed, skip logic but preserve state
    if (recruit.committedTeamId) {
      committedTeamByRecruitId[recruit.id] = recruit.committedTeamId;
      interestByRecruitId[recruit.id] = recruit.interestByTeamId;
      return;
    }

    const nextInterestMap: Record<string, number> = { ...recruit.interestByTeamId };

    // --- 1. User Team Logic ---
    if (selectedTeamId) {
      const prevInterest = nextInterestMap[selectedTeamId] ?? 0;
      const hours = boardSet.has(recruit.id) ? weeklyHoursByRecruitId[recruit.id] ?? 0 : 0;
      const activePitch = activePitchesByRecruitId[recruit.id];
      const pitchGrade = pitchGradesByRecruitId[recruit.id];

      let weeklyGain = 0;

      if (hours > 0) {
        // Hours: 0.5 per hour (20 hours = 10 pts)
        // Stars: 0.2 per star (5 stars = 1 pt)
        // Random: -1 to +1
        const rawGain = hours * 0.5 + recruit.stars * 0.2 + (rng() * 2 - 1);

        // Archetype bonus (RECRUITER +15%, DEVELOPER -5%, TACTICIAN ±0%)
        // Coach skill scales from 0.85x at skill 40 to 1.15x at skill 99
        const skillMult = 0.85 + ((coachSkill - 40) / 59) * 0.3;
        const baseGain = rawGain * archetypeBonus * skillMult;

        let pitchBonus = 0;
        if (activePitch) {
          const motivation = recruit.motivations.find(m => m.pitch === activePitch);
          const importanceMult = getImportanceMultiplier(motivation?.importance);
          const gradeMult = getGradeMultiplier(pitchGrade);

          pitchBonus = baseGain * (importanceMult * gradeMult - 1);
        }

        weeklyGain = Math.max(0, Math.round(baseGain + pitchBonus));
      }

      if (dealbreakerViolationsByRecruitId[recruit.id]) {
        weeklyGain = -5;
      }

      const decay = boardSet.has(recruit.id) ? 0 : 2;
      const nextInterest = Math.max(0, Math.min(100, prevInterest + weeklyGain - decay));
      nextInterestMap[selectedTeamId] = nextInterest;
    }

    // --- 2. CPU Teams Logic ---
    // Simple logic: existing suitors grow interest slowly (3-6 pts)
    Object.keys(nextInterestMap).forEach(teamId => {
        if (teamId === selectedTeamId) return; // Skip user

        const prev = nextInterestMap[teamId];
        // CPU teams "try" ~80% of the time, gaining 3-6 points
        const effort = rng();
        let gain = 0;
        if (effort > 0.2) {
             gain = randInt(rng, 3, 6);
        } else {
             // Occasionally they lose interest or stagnate
             gain = randInt(rng, -2, 1);
        }

        const next = Math.max(0, Math.min(100, prev + gain));
        nextInterestMap[teamId] = next;
    });

    // --- 3. Commitment Check ---
    let bestTeamId: string | null = null;
    let bestInterest = -1;

    Object.entries(nextInterestMap).forEach(([teamId, interest]) => {
        if (interest >= 100) {
            if (interest > bestInterest) {
                bestInterest = interest;
                bestTeamId = teamId;
            }
        }
    });

    interestByRecruitId[recruit.id] = nextInterestMap;
    committedTeamByRecruitId[recruit.id] = bestTeamId;
  });

  return { interestByRecruitId, committedTeamByRecruitId };
}
