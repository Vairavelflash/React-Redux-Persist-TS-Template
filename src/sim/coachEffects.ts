import { PracticeFocus, Tactics } from '../types/sim';

export interface CoachWeekSettings {
  baseTactics: Tactics;
  practiceFocus: PracticeFocus;
  fatigue: number;
}

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

export function applyCoachWeekSettings(settings: CoachWeekSettings): Tactics {
  const next: Tactics = { ...settings.baseTactics };

  if (settings.practiceFocus === 'OFFENSE') {
    next.tempo = 'fast';
    next.slideAggression = 'late';
  }

  if (settings.practiceFocus === 'DEFENSE') {
    next.slideAggression = 'early';
    next.rideClear = 'aggressive';
  }

  if (settings.practiceFocus === 'DISCIPLINE') {
    next.rideClear = 'conservative';
  }

  const fatigue = clamp(settings.fatigue, 0, 100);
  if (fatigue >= 65) {
    next.tempo = 'slow';
    if (next.rideClear === 'aggressive') {
      next.rideClear = 'balanced';
    }
  }

  if (settings.practiceFocus === 'CONDITIONING' && fatigue <= 40 && next.tempo === 'slow') {
    next.tempo = 'normal';
  }

  return next;
}

export function advanceFatigue(previousFatigue: number, focus: PracticeFocus): number {
  const bounded = clamp(previousFatigue, 0, 100);

  const byFocus: Record<PracticeFocus, number> = {
    OFFENSE: 8,
    DEFENSE: 9,
    CONDITIONING: 3,
    DISCIPLINE: 5,
  };

  const recovery = focus === 'CONDITIONING' ? 6 : 2;
  return clamp(bounded + byFocus[focus] - recovery, 0, 100);
}
