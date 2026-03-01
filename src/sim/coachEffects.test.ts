import assert from 'node:assert';
import { describe, test } from 'node:test';
import { applyCoachWeekSettings, advanceFatigue } from './coachEffects.ts';

const base = {
  tempo: 'normal' as const,
  rideClear: 'balanced' as const,
  slideAggression: 'normal' as const,
};

describe('coach effects', () => {
  test('offense focus pushes tempo and late slides', () => {
    const next = applyCoachWeekSettings({ baseTactics: base, practiceFocus: 'OFFENSE', fatigue: 20 });
    assert.strictEqual(next.tempo, 'fast');
    assert.strictEqual(next.slideAggression, 'late');
  });

  test('high fatigue forces slow tempo', () => {
    const next = applyCoachWeekSettings({ baseTactics: base, practiceFocus: 'OFFENSE', fatigue: 70 });
    assert.strictEqual(next.tempo, 'slow');
  });

  test('conditioning focus builds less fatigue than defense focus', () => {
    const conditioning = advanceFatigue(20, 'CONDITIONING');
    const defense = advanceFatigue(20, 'DEFENSE');
    assert.ok(conditioning < defense);
  });
});
