/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import test from 'node:test';
import assert from 'node:assert/strict';
import { clockForPossession } from './timeUtils.ts';

test('clockForPossession calculates correct quarter and time', async (t) => {
  await t.test('start of the game', () => {
    const result = clockForPossession(0, 100);
    assert.deepEqual(result, { quarter: 1, time: '15:00' });
  });

  await t.test('end of first quarter', () => {
    const result = clockForPossession(25, 100);
    assert.deepEqual(result, { quarter: 2, time: '15:00' });
  });

  await t.test('middle of the game', () => {
    const result = clockForPossession(50, 100);
    assert.deepEqual(result, { quarter: 3, time: '15:00' });
  });

  await t.test('middle of a quarter', () => {
    const result = clockForPossession(12, 100);
    // 12/100 * 3600 = 432 seconds elapsed
    // 900 - 432 = 468 seconds remaining
    // 468 / 60 = 7 mins, 48 secs
    assert.deepEqual(result, { quarter: 1, time: '7:48' });
  });

  await t.test('handles total being 0 safely', () => {
    const result = clockForPossession(0, 0);
    assert.deepEqual(result, { quarter: 1, time: '15:00' });
  });

  await t.test('handles possession exceeding total (overtime logic not explicitly handled, capping at Q4)', () => {
    const result = clockForPossession(101, 100);
    // 101/100 * 3600 = 3636 seconds elapsed
    // quarter = Math.min(4, Math.floor(3636 / 900) + 1) = Math.min(4, 5) = 4
    // quarterElapsed = 3636 % 900 = 36
    // remain = 900 - 36 = 864
    // mins = 864 / 60 = 14
    // secs = 864 % 60 = 24
    assert.deepEqual(result, { quarter: 4, time: '14:24' });
  });
});
