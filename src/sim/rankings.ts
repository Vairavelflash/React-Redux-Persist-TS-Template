import { RankingRow, Team, TeamRecord } from '../types/sim';

interface RankingInputRow {
  team: Team;
  record: TeamRecord;
}

function winPct(wins: number, losses: number): number {
  const total = wins + losses;
  return total > 0 ? wins / total : 0;
}

function scoreTeam(row: RankingInputRow): number {
  const overallPct = winPct(row.record.wins, row.record.losses);
  const confPct = winPct(row.record.confWins, row.record.confLosses);
  const pointDiff = row.record.pointsFor - row.record.pointsAgainst;

  return overallPct * 1000 + confPct * 300 + pointDiff * 2 + row.team.prestige * 0.8 + row.record.pointsFor * 0.15;
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
