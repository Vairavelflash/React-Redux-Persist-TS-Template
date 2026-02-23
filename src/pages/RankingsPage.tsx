import { selectTop12Projection, selectTop25Rankings } from '../features/season/seasonSlice';
import { useAppSelector } from '../store/hooks';

function RankingsPage() {
  const top25 = useAppSelector(selectTop25Rankings);
  const top12 = useAppSelector(selectTop12Projection);
  const teams = useAppSelector((state) => state.league.teams);
  const teamById = new Map(teams.map((team) => [team.id, team]));

  return (
    <section>
      <h2>Rankings</h2>
      <div className="card">
        <h3>Top 12 Playoff Projection</h3>
        <ol>
          {top12.map((row) => {
            const team = teamById.get(row.teamId);
            return (
              <li key={row.teamId}>
                {team?.schoolName} {team?.nickname} ({row.record})
              </li>
            );
          })}
        </ol>
      </div>

      <div className="card">
        <h3>Top 25</h3>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Team</th>
              <th>Record</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {top25.map((row) => {
              const team = teamById.get(row.teamId);
              return (
                <tr key={row.teamId}>
                  <td>{row.rank}</td>
                  <td>
                    {team?.schoolName} {team?.nickname}
                  </td>
                  <td>{row.record}</td>
                  <td>{row.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default RankingsPage;
