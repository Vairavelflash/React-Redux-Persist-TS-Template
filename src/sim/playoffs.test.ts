import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPlayoffState, selectPlayoffField, simulatePlayoffRound } from './playoffs.ts';
import type { RankingRow, Team } from '../types/sim.ts';

function createTeams(count = 12): Team[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `team-${index + 1}`,
    schoolName: `School ${index + 1}`,
    nickname: `Nick ${index + 1}`,
    conferenceId: `conf-${Math.floor(index / 8) + 1}`,
    region: 'National',
    prestige: 90 - index,
  }));
}

function createTop12Rankings(): RankingRow[] {
  return Array.from({ length: 12 }, (_, index) => ({
    rank: index + 1,
    teamId: `team-${index + 1}`,
    rating: 100 - index,
    record: `${12 - index}-0`,
    trend: 'same',
  }));
}

describe('playoff loop', () => {
  test('selectPlayoffField maps rankings to 1..12 seeds', () => {
    const field = selectPlayoffField(createTop12Rankings());

    assert.equal(field.length, 12);
    assert.deepEqual(field[0], { seed: 1, teamId: 'team-1' });
    assert.deepEqual(field[11], { seed: 12, teamId: 'team-12' });
  });

  test('buildPlayoffState creates round-1 pairings and empty later rounds', () => {
    const state = buildPlayoffState(selectPlayoffField(createTop12Rankings()));

    assert.equal(state.currentRound, 'ROUND1');
    assert.equal(state.rounds.ROUND1.length, 4);
    assert.equal(state.rounds.QUARTERFINAL.length, 0);
    assert.equal(state.rounds.SEMIFINAL.length, 0);
    assert.equal(state.rounds.FINAL.length, 0);
    assert.equal(state.rounds.ROUND1[0].homeSeed, 5);
    assert.equal(state.rounds.ROUND1[0].awaySeed, 12);
  });

  test('simulatePlayoffRound advances through full bracket and produces champion deterministically', () => {
    const teams = createTeams(12);
    const seeds = selectPlayoffField(createTop12Rankings());

    const runBracket = () => {
      let state = buildPlayoffState(seeds);
      state = simulatePlayoffRound(state, teams, 98765);
      assert.equal(state.currentRound, 'QUARTERFINAL');
      assert.equal(state.rounds.ROUND1.every((game) => !!game.winnerTeamId), true);
      assert.equal(state.rounds.QUARTERFINAL.length, 4);

      state = simulatePlayoffRound(state, teams, 98765);
      assert.equal(state.currentRound, 'SEMIFINAL');
      assert.equal(state.rounds.SEMIFINAL.length, 2);

      state = simulatePlayoffRound(state, teams, 98765);
      assert.equal(state.currentRound, 'FINAL');
      assert.equal(state.rounds.FINAL.length, 1);
      assert.equal(state.championTeamId, null);

      state = simulatePlayoffRound(state, teams, 98765);
      assert.equal(state.currentRound, 'FINAL');
      assert.notEqual(state.championTeamId, null);
      return state;
    };

    const first = runBracket();
    const second = runBracket();

    assert.equal(second.championTeamId, first.championTeamId);
    assert.deepEqual(second.rounds.FINAL[0].result, first.rounds.FINAL[0].result);
  });
});
