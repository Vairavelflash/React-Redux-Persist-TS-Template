import { Player, Position, Team } from '../types/sim';
import { makeRng, randInt } from './rng';

const POSITION_DISTRIBUTION: Position[] = [
  'A', 'A', 'A',
  'M', 'M', 'M', 'M',
  'D', 'D', 'D',
  'LSM',
  'FO',
  'G',
  'A', 'M', 'D', 'M', 'D', 'A', 'M', 'D',
  'LSM', 'M', 'D', 'A',
];

const FIRST_NAMES = ['Alex', 'Jordan', 'Casey', 'Riley', 'Evan', 'Taylor', 'Cameron', 'Parker', 'Drew', 'Logan', 'Avery', 'Blake'];
const LAST_NAMES = ['Hale', 'Turner', 'Bennett', 'Sloan', 'Miller', 'Frost', 'Donovan', 'Chase', 'Brooks', 'Keller', 'Pryor', 'Hayes'];

const clamp = (value: number) => Math.max(40, Math.min(99, value));

function seedToNumber(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

// Cache rosters since they are deterministic (same team+seed = same output).
// During a season sim, generateRoster is called 128+ times per week with the
// same seed, so caching avoids redundant PRNG work.
const rosterCache = new Map<string, Player[]>();

export function generateRoster(team: Team, seed: string): Player[] {
  const cacheKey = `${seed}:${team.id}`;
  const cached = rosterCache.get(cacheKey);
  if (cached) return cached;

  const rng = makeRng(seedToNumber(cacheKey));
  const baseline = 45 + team.prestige * 0.4;

  const roster = POSITION_DISTRIBUTION.map((position, index) => {
    const year = randInt(rng, 1, 4) as 1 | 2 | 3 | 4;
    const variance = randInt(rng, -12, 12);

    const shooting = clamp(Math.round(baseline + variance + (position === 'A' ? 8 : 0) + (position === 'M' ? 4 : 0)));
    const passing = clamp(Math.round(baseline + randInt(rng, -10, 10) + (position === 'M' ? 6 : 0) + (position === 'FO' ? -4 : 0)));
    const speed = clamp(Math.round(baseline + randInt(rng, -9, 11) + (position === 'LSM' ? 5 : 0) + (position === 'G' ? -3 : 0)));
    const defense = clamp(Math.round(baseline + randInt(rng, -11, 10) + (position === 'D' ? 10 : 0) + (position === 'LSM' ? 8 : 0) + (position === 'G' ? 6 : 0)));
    const IQ = clamp(Math.round(baseline + randInt(rng, -8, 12) + (year - 2)));
    const stamina = clamp(Math.round(baseline + randInt(rng, -8, 9)));
    const discipline = clamp(Math.round(baseline + randInt(rng, -7, 10) + (year - 2)));

    const overall = Math.round((shooting + passing + speed + defense + IQ + stamina + discipline) / 7);

    return {
      id: `${team.id}-P${index + 1}`,
      name: `${FIRST_NAMES[randInt(rng, 0, FIRST_NAMES.length - 1)]} ${LAST_NAMES[randInt(rng, 0, LAST_NAMES.length - 1)]}`,
      position,
      year,
      shooting,
      passing,
      speed,
      defense,
      IQ,
      stamina,
      discipline,
      overall,
    };
  });

  rosterCache.set(cacheKey, roster);
  return roster;
}
