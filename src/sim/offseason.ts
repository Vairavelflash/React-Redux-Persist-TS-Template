import type { Recruit } from '../types/sim';

export interface SigningDayResult {
  signedRecruitIds: string[];
  unsignedRecruitIds: string[];
}

export interface ClassTalentSummary {
  totalStars: number;
  averageStars: number;
  blueChipCount: number;
}

export function resolveSigningDay(
  committedRecruits: Recruit[],
  scholarshipsAvailable: number,
): SigningDayResult {
  const ordered = [...committedRecruits].sort((a, b) => {
    if (b.stars !== a.stars) return b.stars - a.stars;
    if (b.potential !== a.potential) return b.potential - a.potential;
    return a.id.localeCompare(b.id);
  });

  const takeCount = Math.max(0, Math.min(scholarshipsAvailable, ordered.length));
  return {
    signedRecruitIds: ordered.slice(0, takeCount).map((recruit) => recruit.id),
    unsignedRecruitIds: ordered.slice(takeCount).map((recruit) => recruit.id),
  };
}

export function summarizeSigningClass(recruits: Recruit[]): ClassTalentSummary {
  if (recruits.length === 0) {
    return {
      totalStars: 0,
      averageStars: 0,
      blueChipCount: 0,
    };
  }

  const totalStars = recruits.reduce((sum, recruit) => sum + recruit.stars, 0);
  const blueChipCount = recruits.filter((recruit) => recruit.stars >= 4).length;

  return {
    totalStars,
    averageStars: Number((totalStars / recruits.length).toFixed(2)),
    blueChipCount,
  };
}
