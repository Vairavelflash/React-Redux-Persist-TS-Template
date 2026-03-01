import { describe, test } from 'node:test';
import assert from 'node:assert';
import type { PlayoffState, SeasonState, Team } from '../types/sim.ts';
import { validateSeasonState } from './seasonValidation.ts';

function createTeams(count = 8): Team[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `team-${index + 1}`,
    schoolName: `School ${index + 1}`,
    nickname: `Nick ${index + 1}`,
    conferenceId: 'conf-1',
    region: 'East',
    prestige: 50,
  }));
}

function createRegularSeasonState(teamCount = 8): SeasonState {
  const teams = createTeams(teamCount);
  const scheduleByWeek = [
    teams.reduce((games, _, i) => {
      if (i % 2 === 0) {
        games.push({
          id: `w1-g${i}`,
          weekIndex: 0,
          homeTeamId: teams[i].id,
          awayTeamId: teams[i + 1].id,
          conferenceGame: true,
        });
      }
      return games;
    }, [] as SeasonState['scheduleByWeek'][number]),
  ];

  const gameResults: SeasonState['gameResults'] = scheduleByWeek[0].map((game, idx) => ({
    id: game.id,
    weekIndex: 0,
    seed: idx,
    teamAId: game.homeTeamId,
    teamBId: game.awayTeamId,
    teamAName: game.homeTeamId,
    teamBName: game.awayTeamId,
    scoreA: 12,
    scoreB: 10,
    statsA: {
      teamId: game.homeTeamId,
      goals: 12,
      shots: 30,
      saves: 10,
      turnovers: 8,
      groundBalls: 20,
      penalties: 3,
      faceoffPct: 0.5,
    },
    statsB: {
      teamId: game.awayTeamId,
      goals: 10,
      shots: 28,
      saves: 11,
      turnovers: 9,
      groundBalls: 18,
      penalties: 2,
      faceoffPct: 0.5,
    },
    topPlayersA: [],
    topPlayersB: [],
    highlights: [],
  }));

  return {
    year: 2026,
    currentWeekIndex: 1,
    completedWeeks: 1,
    gameResults,
    scheduleByWeek,
    isComplete: false,
    phase: 'REGULAR',
    seasonSeed: 42,
    playoffs: null,
  };
}

function createPlayoffState(): PlayoffState {
  return {
    seeds: Array.from({ length: 12 }, (_, index) => ({ seed: index + 1, teamId: `team-${index + 1}` })),
    rounds: {
      ROUND1: [
        { id: 'r1-1', round: 'ROUND1', slot: 1, homeSeed: 5, awaySeed: 12, homeTeamId: 'team-5', awayTeamId: 'team-12', winnerTeamId: null, result: null },
        { id: 'r1-2', round: 'ROUND1', slot: 2, homeSeed: 6, awaySeed: 11, homeTeamId: 'team-6', awayTeamId: 'team-11', winnerTeamId: null, result: null },
        { id: 'r1-3', round: 'ROUND1', slot: 3, homeSeed: 7, awaySeed: 10, homeTeamId: 'team-7', awayTeamId: 'team-10', winnerTeamId: null, result: null },
        { id: 'r1-4', round: 'ROUND1', slot: 4, homeSeed: 8, awaySeed: 9, homeTeamId: 'team-8', awayTeamId: 'team-9', winnerTeamId: null, result: null },
      ],
      QUARTERFINAL: [],
      SEMIFINAL: [],
      FINAL: [],
    },
    currentRound: 'ROUND1',
    championTeamId: null,
  };
}

describe('validateSeasonState', () => {
  test('passes for a valid regular-season state', () => {
    const teams = createTeams(8);
    const state = createRegularSeasonState(8);

    const result = validateSeasonState(state, teams);

    assert.strictEqual(result.isValid, true);
  });

  test('fails when completed week game counts mismatch schedule', () => {
    const teams = createTeams(8);
    const state = createRegularSeasonState(8);
    state.gameResults.pop();

    const result = validateSeasonState(state, teams);

    assert.strictEqual(result.isValid, false);
    assert.match(result.error ?? '', /results mismatch/i);
  });

  test('fails playoff phase if playoff seeds are invalid', () => {
    const teams = createTeams(12);
    const playoffState = createPlayoffState();
    playoffState.seeds[11].seed = 1;

    const state: SeasonState = {
      year: 2026,
      currentWeekIndex: 12,
      completedWeeks: 12,
      gameResults: [],
      scheduleByWeek: [],
      isComplete: false,
      phase: 'PLAYOFF',
      seasonSeed: 101,
      playoffs: playoffState,
    };

    const result = validateSeasonState(state, teams);

    assert.strictEqual(result.isValid, false);
    assert.match(result.error ?? '', /duplicate seed numbers/i);
  });
});
