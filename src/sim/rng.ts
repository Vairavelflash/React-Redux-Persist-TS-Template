export type RngFn = () => number;

export function seedToNumber(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * mulberry32 seeded PRNG. Deterministic for the same numeric seed.
 */
export function makeRng(seed: number): RngFn {
  let t = seed >>> 0;

  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), t | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

export function randInt(rng: RngFn, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function pickOne<T>(rng: RngFn, values: T[]): T {
  if (values.length === 0) {
    throw new Error('pickOne requires a non-empty array.');
  }

  return values[randInt(rng, 0, values.length - 1)];
}

/**
 * Lightweight bell-curve-ish random centered near 0.
 * Typical output range is roughly [-1, 1].
 */
export function normalish(rng: RngFn): number {
  return (rng() + rng() + rng() + rng() - 2) / 2;
}
