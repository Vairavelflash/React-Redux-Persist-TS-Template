import { generateRoster } from './generateRoster';
import { simulateGame } from './matchEngine';
import { GameSummary, PlayoffGame, PlayoffRoundName, PlayoffSeed, PlayoffState, RankingRow, Tactics, Team } from '../types/sim';

const DEFAULT_TACTICS: Tactics = {
  tempo: 'normal',
  rideClear: 'balanced',
  slideAggression: 'normal',
};

function makeGameId(round: PlayoffRoundName, slot: number): string {
  return `playoff-${round.toLowerCase()}-${slot}`;
}

export function selectPlayoffField(top12: RankingRow[]): PlayoffSeed[] {
  if (top12.length < 12) {
    throw new Error(`Top 12 projection requires 12 teams, received ${top12.length}.`);
  }

  return top12.slice(0, 12).map((row, index) => ({
    seed: index + 1,
    teamId: row.teamId,
  }));
}

export function buildPlayoffState(seeds: PlayoffSeed[]): PlayoffState {
  if (seeds.length !== 12) {
    throw new Error(`Playoff requires exactly 12 seeds, received ${seeds.length}.`);
  }

  const bySeed = new Map(seeds.map((item) => [item.seed, item.teamId]));

  const round1: PlayoffGame[] = [
    { id: makeGameId('ROUND1', 1), round: 'ROUND1', slot: 1, homeSeed: 5, awaySeed: 12, homeTeamId: bySeed.get(5) as string, awayTeamId: bySeed.get(12) as string, winnerTeamId: null, result: null },
    { id: makeGameId('ROUND1', 2), round: 'ROUND1', slot: 2, homeSeed: 6, awaySeed: 11, homeTeamId: bySeed.get(6) as string, awayTeamId: bySeed.get(11) as string, winnerTeamId: null, result: null },
    { id: makeGameId('ROUND1', 3), round: 'ROUND1', slot: 3, homeSeed: 7, awaySeed: 10, homeTeamId: bySeed.get(7) as string, awayTeamId: bySeed.get(10) as string, winnerTeamId: null, result: null },
    { id: makeGameId('ROUND1', 4), round: 'ROUND1', slot: 4, homeSeed: 8, awaySeed: 9, homeTeamId: bySeed.get(8) as string, awayTeamId: bySeed.get(9) as string, winnerTeamId: null, result: null },
  ];

  return {
    seeds,
    rounds: {
      ROUND1: round1,
      QUARTERFINAL: [],
      SEMIFINAL: [],
      FINAL: [],
    },
    currentRound: 'ROUND1',
    championTeamId: null,
  };
}

function toSummary(playoffGame: PlayoffGame, scoreA: number, scoreB: number, result: ReturnType<typeof simulateGame>): GameSummary {
  return {
    id: playoffGame.id,
    weekIndex: -1,
    homeTeamId: playoffGame.homeTeamId,
    awayTeamId: playoffGame.awayTeamId,
    homeScore: scoreA,
    awayScore: scoreB,
    teamStatsHome: result.statsA,
    teamStatsAway: result.statsB,
    topPerformers: [...result.topPlayersA.slice(0, 2), ...result.topPlayersB.slice(0, 2)],
  };
}

function nextRoundName(round: PlayoffRoundName): PlayoffRoundName | null {
  if (round === 'ROUND1') return 'QUARTERFINAL';
  if (round === 'QUARTERFINAL') return 'SEMIFINAL';
  if (round === 'SEMIFINAL') return 'FINAL';
  return null;
}

function buildNextRoundGames(state: PlayoffState, round: PlayoffRoundName): PlayoffGame[] {
  const bySeed = new Map(state.seeds.map((item) => [item.seed, item.teamId]));
  const round1 = state.rounds.ROUND1;
  const quarter = state.rounds.QUARTERFINAL;
  const semis = state.rounds.SEMIFINAL;

  if (round === 'QUARTERFINAL') {
    const winner5_12 = round1.find((g) => g.slot === 1)?.winnerTeamId;
    const winner6_11 = round1.find((g) => g.slot === 2)?.winnerTeamId;
    const winner7_10 = round1.find((g) => g.slot === 3)?.winnerTeamId;
    const winner8_9 = round1.find((g) => g.slot === 4)?.winnerTeamId;

    if (!winner5_12 || !winner6_11 || !winner7_10 || !winner8_9) {
      throw new Error('Round 1 must be complete before creating quarterfinal games.');
    }

    return [
      { id: makeGameId('QUARTERFINAL', 1), round: 'QUARTERFINAL', slot: 1, homeSeed: 1, awaySeed: 8, homeTeamId: bySeed.get(1) as string, awayTeamId: winner8_9, winnerTeamId: null, result: null },
      { id: makeGameId('QUARTERFINAL', 2), round: 'QUARTERFINAL', slot: 2, homeSeed: 4, awaySeed: 5, homeTeamId: bySeed.get(4) as string, awayTeamId: winner5_12, winnerTeamId: null, result: null },
      { id: makeGameId('QUARTERFINAL', 3), round: 'QUARTERFINAL', slot: 3, homeSeed: 2, awaySeed: 7, homeTeamId: bySeed.get(2) as string, awayTeamId: winner7_10, winnerTeamId: null, result: null },
      { id: makeGameId('QUARTERFINAL', 4), round: 'QUARTERFINAL', slot: 4, homeSeed: 3, awaySeed: 6, homeTeamId: bySeed.get(3) as string, awayTeamId: winner6_11, winnerTeamId: null, result: null },
    ];
  }

  if (round === 'SEMIFINAL') {
    const winnerQ1 = quarter.find((g) => g.slot === 1)?.winnerTeamId;
    const winnerQ2 = quarter.find((g) => g.slot === 2)?.winnerTeamId;
    const winnerQ3 = quarter.find((g) => g.slot === 3)?.winnerTeamId;
    const winnerQ4 = quarter.find((g) => g.slot === 4)?.winnerTeamId;

    if (!winnerQ1 || !winnerQ2 || !winnerQ3 || !winnerQ4) {
      throw new Error('Quarterfinals must be complete before creating semifinal games.');
    }

    return [
      { id: makeGameId('SEMIFINAL', 1), round: 'SEMIFINAL', slot: 1, homeSeed: 0, awaySeed: 0, homeTeamId: winnerQ1, awayTeamId: winnerQ2, winnerTeamId: null, result: null },
      { id: makeGameId('SEMIFINAL', 2), round: 'SEMIFINAL', slot: 2, homeSeed: 0, awaySeed: 0, homeTeamId: winnerQ3, awayTeamId: winnerQ4, winnerTeamId: null, result: null },
    ];
  }

  if (round === 'FINAL') {
    const winnerS1 = semis.find((g) => g.slot === 1)?.winnerTeamId;
    const winnerS2 = semis.find((g) => g.slot === 2)?.winnerTeamId;

    if (!winnerS1 || !winnerS2) {
      throw new Error('Semifinals must be complete before creating the final game.');
    }

    return [
      { id: makeGameId('FINAL', 1), round: 'FINAL', slot: 1, homeSeed: 0, awaySeed: 0, homeTeamId: winnerS1, awayTeamId: winnerS2, winnerTeamId: null, result: null },
    ];
  }

  return [];
}

export function simulatePlayoffRound(state: PlayoffState, teams: Team[], baseSeed: number, rosterSeed = 'league-roster-v1'): PlayoffState {
  const teamById = new Map(teams.map((team) => [team.id, team]));
  const round = state.currentRound;
  const games = state.rounds[round];

  if (games.length === 0) {
    throw new Error(`No games found for current round ${round}.`);
  }

  const simulatedGames = games.map((game, index) => {
    const homeTeam = teamById.get(game.homeTeamId);
    const awayTeam = teamById.get(game.awayTeamId);

    if (!homeTeam || !awayTeam) {
      throw new Error(`Missing playoff team for game ${game.id}.`);
    }

    const result = simulateGame(
      { team: homeTeam, roster: generateRoster(homeTeam, rosterSeed) },
      { team: awayTeam, roster: generateRoster(awayTeam, rosterSeed) },
      DEFAULT_TACTICS,
      DEFAULT_TACTICS,
      baseSeed + index,
    );

    const winnerTeamId = result.scoreA >= result.scoreB ? game.homeTeamId : game.awayTeamId;

    return {
      ...game,
      winnerTeamId,
      result: toSummary(game, result.scoreA, result.scoreB, result),
    };
  });

  const nextRound = nextRoundName(round);
  const nextRounds = { ...state.rounds, [round]: simulatedGames };

  if (!nextRound) {
    return {
      ...state,
      rounds: nextRounds,
      championTeamId: simulatedGames[0]?.winnerTeamId ?? null,
      currentRound: 'FINAL',
    };
  }

  const nextGames = buildNextRoundGames({ ...state, rounds: nextRounds }, nextRound);

  return {
    ...state,
    rounds: {
      ...nextRounds,
      [nextRound]: nextGames,
    },
    currentRound: nextRound,
    championTeamId: nextRound === 'FINAL' ? null : state.championTeamId,
  };
}
