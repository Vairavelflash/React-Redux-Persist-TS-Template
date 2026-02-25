import { test, describe } from 'node:test';
import assert from 'node:assert';
import { buildGameRecap } from './gameRecap.ts';
import type { GameSummary, PlayerGameStats } from '../types/sim.ts';

describe('buildGameRecap', () => {
  const mockAwayName = 'Away Team';
  const mockHomeName = 'Home Team';

  const baseStats = {
    goals: 0,
    shots: 0,
    saves: 0,
    turnovers: 0,
    groundBalls: 0,
    penalties: 0,
    faceoffPct: 50,
  };

  const createGame = (overrides: Partial<GameSummary>): GameSummary => ({
    id: 'game-1',
    weekIndex: 1,
    homeTeamId: 'home-1',
    awayTeamId: 'away-1',
    homeScore: 10,
    awayScore: 8,
    teamStatsHome: { ...baseStats, teamId: 'home-1' },
    teamStatsAway: { ...baseStats, teamId: 'away-1' },
    topPerformers: [],
    ...overrides,
  });

  test('should handle home team winning', () => {
    const game = createGame({ homeScore: 15, awayScore: 10 });
    const recap = buildGameRecap(game, mockAwayName, mockHomeName);
    assert.strictEqual(recap.summary, 'Home Team beat Away Team by 5 (10-15).');
  });

  test('should handle away team winning', () => {
    const game = createGame({ homeScore: 8, awayScore: 12 });
    const recap = buildGameRecap(game, mockAwayName, mockHomeName);
    assert.strictEqual(recap.summary, 'Away Team beat Home Team by 4 (12-8).');
  });

  test('should identify faceoff dominance', () => {
    const game = createGame({
      teamStatsHome: { ...baseStats, teamId: 'home-1', faceoffPct: 60 },
      teamStatsAway: { ...baseStats, teamId: 'away-1', faceoffPct: 40 },
    });
    const recap = buildGameRecap(game, mockAwayName, mockHomeName);
    assert.strictEqual(recap.keyEdge, 'Home Team dominated faceoffs (60-40).');
  });

  test('should identify ground ball edge', () => {
    const game = createGame({
      teamStatsHome: { ...baseStats, teamId: 'home-1', groundBalls: 25 },
      teamStatsAway: { ...baseStats, teamId: 'away-1', groundBalls: 20 },
    });
    const recap = buildGameRecap(game, mockAwayName, mockHomeName);
    assert.strictEqual(recap.keyEdge, 'Home Team won the ground-ball battle (25-20).');
  });

  test('should identify turnover protection', () => {
    const game = createGame({
      teamStatsHome: { ...baseStats, teamId: 'home-1', turnovers: 10 },
      teamStatsAway: { ...baseStats, teamId: 'away-1', turnovers: 15 },
    });
    const recap = buildGameRecap(game, mockAwayName, mockHomeName);
    assert.strictEqual(recap.keyEdge, 'Home Team protected possession with fewer turnovers (10-15).');
  });

  test('should select MVP correctly based on weighted formula', () => {
    const p1: PlayerGameStats = {
      playerId: 'p1',
      teamId: 'home-1',
      name: 'Player One',
      position: 'A',
      goals: 3,
      assists: 1, // 3 + 0.7 = 3.7
      saves: 0,
    };
    const p2: PlayerGameStats = {
      playerId: 'p2',
      teamId: 'home-1',
      name: 'Player Two',
      position: 'M',
      goals: 2,
      assists: 3, // 2 + 2.1 = 4.1
      saves: 0,
    };
    const p3: PlayerGameStats = {
      playerId: 'p3',
      teamId: 'away-1',
      name: 'Goalie',
      position: 'G',
      goals: 0,
      assists: 0,
      saves: 20, // 20 * 0.15 = 3.0
    };

    const game = createGame({ topPerformers: [p1, p2, p3] });
    const recap = buildGameRecap(game, mockAwayName, mockHomeName);
    assert.strictEqual(recap.mvp?.name, 'Player Two');
  });

  test('should handle no performers for MVP', () => {
    const game = createGame({ topPerformers: [] });
    const recap = buildGameRecap(game, mockAwayName, mockHomeName);
    assert.strictEqual(recap.mvp, null);
  });

  test('should format shooting efficiency correctly', () => {
    const game = createGame({
      teamStatsHome: { ...baseStats, teamId: 'home-1', goals: 10, shots: 40 }, // 25%
      teamStatsAway: { ...baseStats, teamId: 'away-1', goals: 8, shots: 32 }, // 25%
    });
    const recap = buildGameRecap(game, mockAwayName, mockHomeName);
    assert.strictEqual(recap.efficiencyNote, 'Away Team shot 25.0% · Home Team shot 25.0%');
  });

  test('should handle zero shots in efficiency note', () => {
    const game = createGame({
      teamStatsHome: { ...baseStats, teamId: 'home-1', goals: 0, shots: 0 },
      teamStatsAway: { ...baseStats, teamId: 'away-1', goals: 0, shots: 0 },
    });
    const recap = buildGameRecap(game, mockAwayName, mockHomeName);
    assert.strictEqual(recap.efficiencyNote, 'Away Team shot 0.0% · Home Team shot 0.0%');
  });
});
