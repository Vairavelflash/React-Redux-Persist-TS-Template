import { GameSummary, RankingRow, Team, TeamRecord } from '../types/sim';

export interface TeamResume {
  teamId: string;
  sos: number;
  qualityWins: number;
  eliteWins: number;
  badLosses: number;
}

interface RankingInputRow {
  team: Team;
  record: TeamRecord;
  resume: TeamResume;
  score: number;
}

const DEFAULT_RECORD: TeamRecord = { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0 };

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

function makePairKey(teamAId: string, teamBId: string): string {
  return [teamAId, teamBId].sort().join('__');
}

function buildHeadToHeadMap(resultsByWeek: GameSummary[][]): Record<string, Record<string, number>> {
  const headToHeadWins: Record<string, Record<string, number>> = {};

  resultsByWeek.flat().forEach((game) => {
    const { winner, loser } = getWinnerLoser(game);
    const key = makePairKey(winner, loser);
    if (!headToHeadWins[key]) {
      headToHeadWins[key] = {};
    }

    headToHeadWins[key][winner] = (headToHeadWins[key][winner] ?? 0) + 1;
    headToHeadWins[key][loser] = headToHeadWins[key][loser] ?? 0;
  });

  return headToHeadWins;
}

function headToHeadEdge(teamAId: string, teamBId: string, headToHeadWins: Record<string, Record<string, number>>): number {
  const series = headToHeadWins[makePairKey(teamAId, teamBId)];
  if (!series) return 0;

  const aWins = series[teamAId] ?? 0;
  const bWins = series[teamBId] ?? 0;
  if (aWins === bWins) return 0;
  return aWins > bWins ? 1 : -1;
}

export function computeResumeByTeam(
  teams: Team[],
  recordsByTeamId: Record<string, TeamRecord>,
  resultsByWeek: GameSummary[][],
): Record<string, TeamResume> {
  const opponentsByTeam: Record<string, string[]> = Object.fromEntries(teams.map((team) => [team.id, [] as string[]]));
  const qualityWinsByTeam: Record<string, number> = Object.fromEntries(teams.map((team) => [team.id, 0]));
  const eliteWinsByTeam: Record<string, number> = Object.fromEntries(teams.map((team) => [team.id, 0]));
  const badLossesByTeam: Record<string, number> = Object.fromEntries(teams.map((team) => [team.id, 0]));

  resultsByWeek.flat().forEach((game) => {
    opponentsByTeam[game.homeTeamId].push(game.awayTeamId);
    opponentsByTeam[game.awayTeamId].push(game.homeTeamId);

    const { winner, loser } = getWinnerLoser(game);
    const loserRecord = recordsByTeamId[loser] ?? DEFAULT_RECORD;
    const winnerRecord = recordsByTeamId[winner] ?? DEFAULT_RECORD;

    const loserWinPct = winPct(loserRecord.wins, loserRecord.losses);
    const winnerWinPct = winPct(winnerRecord.wins, winnerRecord.losses);

    if (loserWinPct >= 0.6) qualityWinsByTeam[winner] += 1;
    if (loserWinPct >= 0.75) eliteWinsByTeam[winner] += 1;
    if (winnerWinPct < 0.35) badLossesByTeam[loser] += 1;
  });

  return Object.fromEntries(
    teams.map((team) => {
      const opponents = opponentsByTeam[team.id] ?? [];
      const sos =
        opponents.reduce((sum, oppId) => {
          const oppRecord = recordsByTeamId[oppId] ?? DEFAULT_RECORD;
          return sum + winPct(oppRecord.wins, oppRecord.losses);
        }, 0) / Math.max(opponents.length, 1);

      return [
        team.id,
        {
          teamId: team.id,
          sos,
          qualityWins: qualityWinsByTeam[team.id] ?? 0,
          eliteWins: eliteWinsByTeam[team.id] ?? 0,
          badLosses: badLossesByTeam[team.id] ?? 0,
        } as TeamResume,
      ];
    }),
  );
}

function scoreTeam(team: Team, record: TeamRecord, resume: TeamResume): number {
  const overallPct = winPct(record.wins, record.losses);
  const confPct = winPct(record.confWins, record.confLosses);
  const pointDiff = record.pointsFor - record.pointsAgainst;

  return (
    overallPct * 1000 +
    confPct * 240 +
    resume.sos * 240 +
    resume.qualityWins * 28 +
    resume.eliteWins * 18 -
    resume.badLosses * 34 +
    pointDiff * 1.5 +
    team.prestige * 0.4
  );
}

export function computeRankings(
  teams: Team[],
  recordsByTeamId: Record<string, TeamRecord>,
  resultsByWeek: GameSummary[][],
  topN = 25,
): RankingRow[] {
  const resumeByTeam = computeResumeByTeam(teams, recordsByTeamId, resultsByWeek);
  const headToHeadWins = buildHeadToHeadMap(resultsByWeek);

  const rows: RankingInputRow[] = teams.map((team) => {
    const record = recordsByTeamId[team.id] ?? DEFAULT_RECORD;
    const resume = resumeByTeam[team.id];
    return { team, record, resume, score: scoreTeam(team, record, resume) };
  });

  rows.sort((a, b) => {
    const scoreDelta = b.score - a.score;
    if (Math.abs(scoreDelta) > 1) return scoreDelta;

    const h2h = headToHeadEdge(a.team.id, b.team.id, headToHeadWins);
    if (h2h !== 0) return -h2h;

    const aWinPct = winPct(a.record.wins, a.record.losses);
    const bWinPct = winPct(b.record.wins, b.record.losses);
    if (bWinPct !== aWinPct) return bWinPct - aWinPct;

    if (b.resume.sos !== a.resume.sos) return b.resume.sos - a.resume.sos;

    const aPointDiff = a.record.pointsFor - a.record.pointsAgainst;
    const bPointDiff = b.record.pointsFor - b.record.pointsAgainst;
    if (bPointDiff !== aPointDiff) return bPointDiff - aPointDiff;

    return b.team.prestige - a.team.prestige;
  });

  return rows.slice(0, topN).map((row, index) => ({
    rank: index + 1,
    teamId: row.team.id,
    points: Math.round(row.score),
    record: `${row.record.wins}-${row.record.losses}`,
  }));
}

export function computePlayoffProjection(teams: Team[], recordsByTeamId: Record<string, TeamRecord>, resultsByWeek: GameSummary[][]) {
  return computeRankings(teams, recordsByTeamId, resultsByWeek, 12);
}
