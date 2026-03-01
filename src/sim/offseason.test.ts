import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveSigningDay, summarizeSigningClass } from './offseason.ts';

type RecruitShape = Parameters<typeof resolveSigningDay>[0][number];

function makeRecruit(id: string, stars: number, potential: number): RecruitShape {
  return {
    id,
    name: `Recruit ${id}`,
    position: 'M',
    stars,
    region: 'Northeast',
    potential,
    committedTeamId: null,
    motivations: [],
    dealbreaker: null,
    interestByTeamId: {},
  };
}

const recruits: RecruitShape[] = [
  makeRecruit('a', 3, 80),
  makeRecruit('b', 5, 70),
  makeRecruit('c', 4, 91),
  makeRecruit('d', 4, 86),
];

test('resolveSigningDay prioritizes stars then potential with scholarship cap', () => {
  const result = resolveSigningDay(recruits, 2);
  assert.deepEqual(result.signedRecruitIds, ['b', 'c']);
  assert.deepEqual(result.unsignedRecruitIds, ['d', 'a']);
});

test('summarizeSigningClass returns compact class quality metrics', () => {
  const result = summarizeSigningClass(recruits);
  assert.equal(result.totalStars, 16);
  assert.equal(result.averageStars, 4);
  assert.equal(result.blueChipCount, 3);
});
