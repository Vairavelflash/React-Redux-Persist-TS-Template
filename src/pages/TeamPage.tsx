import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { selectConferenceById, selectTeamWithRosterSummary } from '../features/league/leagueSlice';
import { useAppSelector } from '../store/hooks';

function TeamPage() {
  const { id } = useParams();
  const teamSummary = useAppSelector((state) => (id ? selectTeamWithRosterSummary(state, id) : null));

  const conference = useAppSelector((state) => {
    if (!teamSummary) return null;
    return selectConferenceById(state, teamSummary.team.conferenceId);
  });

  const byPosition = useMemo(() => {
    if (!teamSummary) return {} as Record<string, number>;
    return teamSummary.topPlayers.reduce<Record<string, number>>((acc, player) => {
      acc[player.position] = (acc[player.position] || 0) + 1;
      return acc;
    }, {});
  }, [teamSummary]);

  if (!teamSummary) {
    return (
      <section className="card">
        <h2>Team not found</h2>
        <Link to="/conferences">Back to conferences</Link>
      </section>
    );
  }

  return (
    <section className="card">
      <h2>
        {teamSummary.team.schoolName} {teamSummary.team.nickname}
      </h2>
      <p>
        Conference: <strong>{conference?.name ?? teamSummary.team.conferenceId}</strong>
      </p>
      <p>
        Region: <strong>{teamSummary.team.region}</strong> · Prestige: <strong>{teamSummary.team.prestige}</strong>
      </p>
      <p>
        Generated Roster Overall: <strong>{teamSummary.rosterOverall}</strong> (size {teamSummary.rosterSize})
      </p>

      <h3>Top Players</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Pos</th>
            <th>Year</th>
            <th>Age</th>
            <th>Skill</th>
            <th>Overall</th>
          </tr>
        </thead>
        <tbody>
          {teamSummary.topPlayers.map((player) => (
            <tr key={player.id}>
              <td>{player.name}</td>
              <td>{player.position}</td>
              <td>{player.year}</td>
              <td>{player.age}</td>
              <td>{player.skill}</td>
              <td>{player.overall}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p>Top-player position mix: {Object.entries(byPosition).map(([pos, count]) => `${pos}(${count})`).join(', ')}</p>
      <Link to="/conferences">← Back to conferences</Link>
    </section>
  );
}

export default TeamPage;
