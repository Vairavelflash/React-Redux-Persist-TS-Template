import { Position, Recruit, Team } from '../types/sim';
import { makeRng, pickOne, randInt } from './rng';

const FIRST_NAMES = ['Jalen', 'Mason', 'Ty', 'Cooper', 'Evan', 'Noah', 'Chase', 'Dylan', 'Kade', 'Liam', 'Owen', 'Brady'];
const LAST_NAMES = ['Hale', 'Rivers', 'Dalton', 'Pierce', 'Maddox', 'Sloan', 'Whitaker', 'Cross', 'Mercer', 'Keane', 'Foster', 'Wells'];
const REGIONS = ['Northeast', 'Mid-Atlantic', 'South', 'Midwest', 'West'];
const POSITIONS: Position[] = ['A', 'M', 'D', 'LSM', 'FO', 'G'];

export function generateRecruitPool(seed: number, count = 180): Recruit[] {
  const rng = makeRng(seed);

  return Array.from({ length: count }, (_, index) => {
    const starsRoll = randInt(rng, 1, 100);
    const stars = starsRoll > 96 ? 5 : starsRoll > 80 ? 4 : starsRoll > 50 ? 3 : 2;
    const potentialBase = 58 + stars * 7;
    const potential = Math.min(99, potentialBase + randInt(rng, -5, 6));

    return {
      id: `recruit-${seed}-${index + 1}`,
      name: `${pickOne(rng, FIRST_NAMES)} ${pickOne(rng, LAST_NAMES)}`,
      position: pickOne(rng, POSITIONS),
      stars,
      region: pickOne(rng, REGIONS),
      potential,
      committedTeamId: null,
    };
  });
}

export function estimateRecruitFit(recruit: Recruit, team: Team): number {
  const prestigeWeight = team.prestige * 0.55;
  const starWeight = recruit.stars * 8;
  const regionBonus = recruit.region === team.region ? 9 : 0;
  return Math.round(prestigeWeight + starWeight + regionBonus);
}
