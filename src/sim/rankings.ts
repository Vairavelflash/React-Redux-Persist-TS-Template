import { GameSummary, RankingRow, Team, TeamRecord } from '../types/sim';

export interface TeamResume {
  teamId: string;
  sos: number;
  qualityWins: number;
  badLosses: number;
}

interface RankingInputRow {
  team: Team;
  record: TeamRecord;
  resume: TeamResume;
}

function winPct(wins: number, losses: number): number {
  const total = wins + losses;
  return total > 0 ? wins / total : 0;
}

function getWinnerLoser(game: GameSummary): { winner: string; loser: string } {
  if (game.homeScore >= game.awayScore) {
    return { winner: game.homeTeamId, loser: game.awayTeamId };
  }
  return { winner: game.awayTeamId, loser: game.homeTeamId };
}

export function computeResumeByTeam(
  teams: Team[],
  recordsByTeamId: Record<string, TeamRecord>,
  resultsByWeek: GameSummary[][],
): Record<string, TeamResume> {
  const opponentsByTeam: Record<string, string[]> = Object.fromEntries(teams.map((team) => [team.id, [] as string[]]));
  const qualityWinsByTeam: Record<string, number> = Object.fromEntries(teams.map((team) => [team.id, 0]));
  const badLossesByTeam: Record<string, number> = Object.fromEntries(teams.map((team) => [team.id, 0]));

  resultsByWeek.flat().forEach((game) => {
    opponentsByTeam[game.homeTeamId].push(game.awayTeamId);
    opponentsByTeam[game.awayTeamId].push(game.homeTeamId);

    const { winner, loser } = getWinnerLoser(game);
    const winnerOppRecord = recordsByTeamId[loser] ?? { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0 };
    const loserOppRecord = recordsByTeamId[winner] ?? { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0 };

    const winnerOppPct = winPct(winnerOppRecord.wins, winnerOppRecord.losses);
    const loserOppPct = winPct(loserOppRecord.wins, loserOppRecord.losses);

    if (winnerOppPct >= 0.6) qualityWinsByTeam[winner] += 1;
    if (loserOppPct < 0.4) badLossesByTeam[loser] += 1;
  });

  return Object.fromEntries(
    teams.map((team) => {
      const opponents = opponentsByTeam[team.id] ?? [];
      const sos =
        opponents.reduce((sum, oppId) => {
          const oppRecord = recordsByTeamId[oppId] ?? { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0 };
          return sum + winPct(oppRecord.wins, oppRecord.losses);
        }, 0) / Math.max(opponents.length, 1);

      return [
        team.id,
        {
          teamId: team.id,
          sos,
          qualityWins: qualityWinsByTeam[team.id] ?? 0,
          badLosses: badLossesByTeam[team.id] ?? 0,
        } as TeamResume,
      ];
    }),
  );
}

function scoreTeam(row: RankingInputRow): number {
  const overallPct = winPct(row.record.wins, row.record.losses);
  const confPct = winPct(row.record.confWins, row.record.confLosses);
  const pointDiff = row.record.pointsFor - row.record.pointsAgainst;

  return (
    overallPct * 1000 +
    confPct * 260 +
    row.resume.sos * 220 +
    row.resume.qualityWins * 35 -
    row.resume.badLosses * 30 +
    pointDiff * 1.5 +
    row.team.prestige * 0.5
  );
}

export function computeRankings(
  teams: Team[],
  recordsByTeamId: Record<string, TeamRecord>,
  resultsByWeek: GameSummary[][],
  topN = 25,
): RankingRow[] {
  const resumeByTeam = computeResumeByTeam(teams, recordsByTeamId, resultsByWeek);

  return teams
    .map((team) => {
      const record = recordsByTeamId[team.id] ?? { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0 };
      const resume = resumeByTeam[team.id];
      return { team, record, resume, score: scoreTeam({ team, record, resume }) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map((row, index) => ({
      rank: index + 1,
      teamId: row.team.id,
      points: Math.round(row.score),
      record: `${row.record.wins}-${row.record.losses}`,
    }));
}

export function computePlayoffProjection(teams: Team[], recordsByTeamId: Record<string, TeamRecord>, resultsByWeek: GameSummary[][]) {
  return computeRankings(teams, recordsByTeamId, resultsByWeek, 12);
}
