import { useMemo } from 'react';
import { useAppSelector } from '../store/hooks';
import { selectTeamRecords, selectTop12Projection, selectTop25Rankings } from '../features/season/seasonSlice';
import { selectTeams } from '../features/league/leagueSlice';

function RankingsPage() {
  const top25 = useAppSelector(selectTop25Rankings);
  const top12 = useAppSelector(selectTop12Projection);
  const teams = useAppSelector(selectTeams);
  const records = useAppSelector(selectTeamRecords);

  const teamById = useMemo(() => {
    return new Map(teams.map((team) => [team.id, team]));
  }, [teams]);

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
    </div>
  );
}

export default RankingsPage;
