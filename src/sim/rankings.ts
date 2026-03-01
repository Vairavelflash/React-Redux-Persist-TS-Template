import { RankingRow, RankingScoreBreakdown, Team, TeamRecord } from '../types/sim';

interface RankingInputRow {
  team: Team;
  record: TeamRecord;
}

function winPct(wins: number, losses: number): number {
  const total = wins + losses;
  return total > 0 ? wins / total : 0;
}

export const RANKING_WEIGHTS = {
  overallWinPct: 1000,
  conferenceWinPct: 300,
  pointDifferential: 2,
  prestige: 0.8,
  scoringVolume: 0.15,
} as const;

export function computeRankingBreakdown(team: Team, record: TeamRecord): RankingScoreBreakdown {
  const overallWinPctPoints = winPct(record.wins, record.losses) * RANKING_WEIGHTS.overallWinPct;
  const conferenceWinPctPoints = winPct(record.confWins, record.confLosses) * RANKING_WEIGHTS.conferenceWinPct;
  const pointDifferentialPoints =
    (record.pointsFor - record.pointsAgainst) * RANKING_WEIGHTS.pointDifferential;
  const prestigePoints = team.prestige * RANKING_WEIGHTS.prestige;
  const scoringVolumePoints = record.pointsFor * RANKING_WEIGHTS.scoringVolume;
  const totalPoints =
    overallWinPctPoints + conferenceWinPctPoints + pointDifferentialPoints + prestigePoints + scoringVolumePoints;

  return {
    overallWinPctPoints,
    conferenceWinPctPoints,
    pointDifferentialPoints,
    prestigePoints,
    scoringVolumePoints,
    totalPoints,
  };
}

function scoreTeam(row: RankingInputRow): number {
  return computeRankingBreakdown(row.team, row.record).totalPoints;
}

export function computeRankings(teams: Team[], recordsByTeamId: Record<string, TeamRecord>, topN = 25): RankingRow[] {
  return teams
    .map((team) => {
      const record = recordsByTeamId[team.id] ?? { wins: 0, losses: 0, confWins: 0, confLosses: 0, pointsFor: 0, pointsAgainst: 0 };
      return { team, record, score: scoreTeam({ team, record }) };
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

export function computePlayoffProjection(teams: Team[], recordsByTeamId: Record<string, TeamRecord>) {
  return computeRankings(teams, recordsByTeamId, 12);
}
