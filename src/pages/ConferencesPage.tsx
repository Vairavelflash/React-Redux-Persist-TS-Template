import { Link } from 'react-router-dom';
import { selectTeamsByConference } from '../features/league/leagueSlice';
import { useAppSelector } from '../store/hooks';

function ConferencesPage() {
  const conferenceTables = useAppSelector(selectTeamsByConference);

  return (
    <section>
      <h2>Conferences</h2>
      {conferenceTables.map(({ conference, teams }) => (
        <div key={conference.id} className="conferenceCard">
          <h3>{conference.name}</h3>
          <table>
            <thead>
              <tr>
                <th>School</th>
                <th>Nickname</th>
                <th>Region</th>
                <th>Prestige</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.id}>
                  <td>
                    <Link to={`/team/${team.id}`}>{team.schoolName}</Link>
                  </td>
                  <td>{team.nickname}</td>
                  <td>{team.region}</td>
                  <td>{team.prestige}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </section>
  );
}

export default ConferencesPage;
