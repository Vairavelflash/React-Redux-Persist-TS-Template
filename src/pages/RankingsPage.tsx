import { useMemo } from 'react';
import { useAppSelector } from '../store/hooks';
import { selectTeamRecords, selectTop12Projection, selectTop25Rankings } from '../features/season/seasonSlice';
import { selectTeams } from '../features/league/leagueSlice';
import { computeRankingBreakdown, RANKING_WEIGHTS } from '../sim/rankings';

function RankingsPage() {
  const top25 = useAppSelector(selectTop25Rankings);
  const top12 = useAppSelector(selectTop12Projection);
  const teams = useAppSelector(selectTeams);
  const records = useAppSelector(selectTeamRecords);

  const teamById = useMemo(() => {
    return new Map(teams.map((team) => [team.id, team]));
  }, [teams]);

  const topTeamBreakdown = useMemo(() => {
    const topTeamId = top25[0]?.teamId;
    if (!topTeamId) return null;

    const team = teamById.get(topTeamId);
    const record = records[topTeamId];
    if (!team || !record) return null;

    return {
      team,
      breakdown: computeRankingBreakdown(team, record),
    };
  }, [records, teamById, top25]);

  const hasGamesPlayed = useMemo(() => {
    return Object.values(records).some((record) => record.wins + record.losses > 0);
  }, [records]);

  return (
    <div className="grid2">
      <section className="card">
        <h2>Top 25</h2>
        <p className="text-sm text-gray-500">Weekly deterministic power ranking based on record and point margin.</p>

        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Team</th>
              <th>Record</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {top25.map((row) => {
              const team = teamById.get(row.teamId);
              return (
                <tr key={row.teamId}>
                  <td>{row.rank}</td>
                  <td>
                    {team?.schoolName} <span className="text-xs text-gray-500">({team?.nickname})</span>
                  </td>
                  <td>{row.record}</td>
                  <td>{row.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h2>Top 12 Playoff Projection</h2>
        <p className="text-sm text-gray-500">If the season ended today, this would be the projected 12-team field.</p>

        <table>
          <thead>
            <tr>
              <th>Seed</th>
              <th>Team</th>
              <th>Record</th>
            </tr>
          </thead>
          <tbody>
            {top12.map((row) => {
              const team = teamById.get(row.teamId);
              const byeLabel = row.rank <= 4 ? ' (Bye)' : '';
              return (
                <tr key={row.teamId}>
                  <td>#{row.rank}</td>
                  <td>
                    {team?.schoolName} <span className="text-xs text-gray-500">({team?.nickname})</span>
                    {byeLabel}
                  </td>
                  <td>{row.record}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!hasGamesPlayed && (
          <p className="text-sm text-gray-500" style={{ marginTop: '0.75rem' }}>
            No games played yet. Rankings currently reflect baseline team profile scoring.
          </p>
        )}
      </section>

      <section className="card" style={{ gridColumn: '1 / -1' }}>
        <h3>Ranking Formula Transparency</h3>
        <p className="text-sm text-gray-500">
          Points are deterministic and built from season performance plus a small baseline program profile signal.
        </p>
        <ul style={{ marginTop: '0.5rem', marginLeft: '1rem' }}>
          <li>Overall win% × {RANKING_WEIGHTS.overallWinPct}</li>
          <li>Conference win% × {RANKING_WEIGHTS.conferenceWinPct}</li>
          <li>Point differential × {RANKING_WEIGHTS.pointDifferential}</li>
          <li>Program prestige × {RANKING_WEIGHTS.prestige}</li>
          <li>Total points scored × {RANKING_WEIGHTS.scoringVolume}</li>
        </ul>

        {topTeamBreakdown && (
          <div style={{ marginTop: '1rem' }}>
            <strong>
              Current #1 score breakdown: {topTeamBreakdown.team.schoolName} ({topTeamBreakdown.team.nickname})
            </strong>
            <ul style={{ marginTop: '0.5rem', marginLeft: '1rem' }}>
              <li>Overall win% contribution: {topTeamBreakdown.breakdown.overallWinPctPoints.toFixed(1)}</li>
              <li>Conference win% contribution: {topTeamBreakdown.breakdown.conferenceWinPctPoints.toFixed(1)}</li>
              <li>Point differential contribution: {topTeamBreakdown.breakdown.pointDifferentialPoints.toFixed(1)}</li>
              <li>Prestige contribution: {topTeamBreakdown.breakdown.prestigePoints.toFixed(1)}</li>
              <li>Scoring volume contribution: {topTeamBreakdown.breakdown.scoringVolumePoints.toFixed(1)}</li>
              <li>
                <strong>Total: {Math.round(topTeamBreakdown.breakdown.totalPoints)}</strong>
              </li>
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}

export default RankingsPage;
