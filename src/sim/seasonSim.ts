import { generateRoster } from './generateRoster';
import { simulateGame } from './matchEngine';
import { Conference, GameSummary, ScheduledGame, Tactics, Team, TeamRecord } from '../types/sim';

interface SeasonSimInputs {
  teams: Team[];
  conferences: Conference[];
  rosterSeed: string;
  tacticsByTeamId?: Record<string, Tactics>;
}

const DEFAULT_TACTICS: Tactics = {
  tempo: 'normal',
  rideClear: 'balanced',
  slideAggression: 'normal',
};

function blankRecord(): TeamRecord {
  return { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0 };
}

export function buildRecordsFromResults(
  teams: Team[],
  resultsByWeek: GameSummary[][],
  teamConferenceMap: Record<string, string>,
): Record<string, TeamRecord> {
  const records: Record<string, TeamRecord> = Object.fromEntries(teams.map((team) => [team.id, blankRecord()]));

  resultsByWeek.flat().forEach((game) => {
    const home = records[game.homeTeamId];
    const away = records[game.awayTeamId];

    home.pointsFor += game.homeScore;
    home.pointsAgainst += game.awayScore;
    away.pointsFor += game.awayScore;
    away.pointsAgainst += game.homeScore;

    const isConferenceGame = teamConferenceMap[game.homeTeamId] === teamConferenceMap[game.awayTeamId];

    if (game.homeScore > game.awayScore) {
      home.wins += 1;
      away.losses += 1;
      if (isConferenceGame) {
        home.confWins += 1;
        away.confLosses += 1;
      }
    } else {
      away.wins += 1;
      home.losses += 1;
      if (isConferenceGame) {
        away.confWins += 1;
        home.confLosses += 1;
      }
    }
  });

  return records;
}

export function simulateWeek(
  weekGames: ScheduledGame[],
  inputs: SeasonSimInputs,
  weekIndex: number,
  baseSeed: number,
): GameSummary[] {
  const teamById = new Map(inputs.teams.map((team) => [team.id, team]));

  return weekGames.map((game, gameIndex) => {
    const home = teamById.get(game.homeTeamId);
    const away = teamById.get(game.awayTeamId);

    if (!home || !away) {
      throw new Error(`Missing team in week simulation for game ${game.id}`);
    }

    const homeTactics = inputs.tacticsByTeamId?.[home.id] ?? DEFAULT_TACTICS;
    const awayTactics = inputs.tacticsByTeamId?.[away.id] ?? DEFAULT_TACTICS;

    const result = simulateGame(
      { team: home, roster: generateRoster(home, inputs.rosterSeed) },
      { team: away, roster: generateRoster(away, inputs.rosterSeed) },
      homeTactics,
      awayTactics,
      baseSeed + weekIndex * 1000 + gameIndex,
    );

    return {
      id: game.id,
      weekIndex: game.weekIndex,
      homeTeamId: game.homeTeamId,
      awayTeamId: game.awayTeamId,
      homeScore: result.scoreA,
      awayScore: result.scoreB,
      teamStatsHome: result.statsA,
      teamStatsAway: result.statsB,
      topPerformers: [...result.topPlayersA.slice(0, 2), ...result.topPlayersB.slice(0, 2)],
    };
  });
}

export function simulateSeasonFrom(
  fromWeekIndex: number,
  scheduleByWeek: ScheduledGame[][],
  existingResultsByWeek: GameSummary[][],
  inputs: SeasonSimInputs,
  baseSeed: number,
): { resultsByWeek: GameSummary[][]; recordsByTeamId: Record<string, TeamRecord> } {
  const resultsByWeek = scheduleByWeek.map((_, index) => existingResultsByWeek[index] ?? []);

  for (let weekIndex = fromWeekIndex; weekIndex < scheduleByWeek.length; weekIndex += 1) {
    if (resultsByWeek[weekIndex].length > 0) continue;
    resultsByWeek[weekIndex] = simulateWeek(scheduleByWeek[weekIndex], inputs, weekIndex, baseSeed);
  }

  const confMap = Object.fromEntries(inputs.teams.map((team) => [team.id, team.conferenceId]));

  return {
    resultsByWeek,
    recordsByTeamId: buildRecordsFromResults(inputs.teams, resultsByWeek, confMap),
  };
}
