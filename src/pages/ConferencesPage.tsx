import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { selectConferenceBrowserRows } from '../features/league/leagueSlice';
import { useAppSelector } from '../store/hooks';

function ConferencesPage() {
  const conferenceRows = useAppSelector(selectConferenceBrowserRows);
  const [regionFilter, setRegionFilter] = useState('all');
  const [searchText, setSearchText] = useState('');

  const regions = useMemo(
    () => ['all', ...new Set(conferenceRows.flatMap(({ teams }) => teams.map((team) => team.region)))],
    [conferenceRows],
  );

  const filteredRows = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return conferenceRows.filter(({ conference, teams }) => {
      const matchesRegion = regionFilter === 'all' || teams.some((team) => team.region === regionFilter);
      const matchesSearch =
        query.length === 0 ||
        conference.name.toLowerCase().includes(query) ||
        teams.some((team) => `${team.schoolName} ${team.nickname}`.toLowerCase().includes(query));
      return matchesRegion && matchesSearch;
    });
  }, [conferenceRows, regionFilter, searchText]);

  return (
    <section>
      <h2>Conferences</h2>
      <div className="card">
        <div className="grid2">
          <label>
            Search conference/team
            <input
              type="text"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Atlantic, Harbor, Summit..."
            />
          </label>
          <label>
            Region filter
            <select value={regionFilter} onChange={(event) => setRegionFilter(event.target.value)}>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region === 'all' ? 'All regions' : region}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="text-sm text-gray-500 m-0">Showing {filteredRows.length} conferences.</p>
      </div>

      {filteredRows.map(({ conference, teams, rosterStrength, averagePrestige, teamCount }) => (
        <div key={conference.id} className="conferenceCard">
          <h3 className="m-0">{conference.name}</h3>
          <p className="text-sm text-gray-500 mt-2">
            Teams: <strong>{teamCount}</strong> · Avg prestige: <strong>{averagePrestige}</strong> · Generated roster
            strength: <strong>{rosterStrength}</strong>
          </p>
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
