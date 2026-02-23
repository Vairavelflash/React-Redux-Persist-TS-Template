import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { selectWeekGames } from '../features/season/seasonSlice';
import { useAppSelector } from '../store/hooks';

function SeasonWeekPage() {
  const { weekIndex } = useParams();
  const parsed = Math.max(0, Math.min(11, Number(weekIndex ?? 0)));
  const selector = useMemo(() => selectWeekGames(parsed), [parsed]);
  const rows = useAppSelector(selector);
  const teams = useAppSelector((state) => state.league.teams);
  const conferences = useAppSelector((state) => state.league.conferences);
  const [conferenceFilter, setConferenceFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'alpha' | 'score'>('alpha');

  const teamById = useMemo(() => new Map(teams.map((team) => [team.id, team])), [teams]);

  const displayed = rows
    .filter(({ game }) => {
      if (conferenceFilter === 'ALL') return true;
      const home = teamById.get(game.homeTeamId);
      const away = teamById.get(game.awayTeamId);
      return home?.conferenceId === conferenceFilter || away?.conferenceId === conferenceFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'score') {
        const aTotal = (a.result?.homeScore ?? 0) + (a.result?.awayScore ?? 0);
        const bTotal = (b.result?.homeScore ?? 0) + (b.result?.awayScore ?? 0);
        return bTotal - aTotal;
      }

      const aName = teamById.get(a.game.homeTeamId)?.schoolName ?? '';
      const bName = teamById.get(b.game.homeTeamId)?.schoolName ?? '';
      return aName.localeCompare(bName);
    });

  return (
    <section>
      <h2>Week {parsed + 1} Results</h2>
      <div className="card">
        <div className="seedRow">
          <label>
            Filter by conference
            <select value={conferenceFilter} onChange={(event) => setConferenceFilter(event.target.value)}>
              <option value="ALL">All Conferences</option>
              {conferences.map((conf) => (
                <option key={conf.id} value={conf.id}>
                  {conf.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Sort
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value as 'alpha' | 'score')}>
              <option value="alpha">Home Team A-Z</option>
              <option value="score">Highest Total Score</option>
            </select>
          </label>
        </div>

        <table>
          <thead>
            <tr>
              <th>Away</th>
              <th>Home</th>
              <th>Score</th>
              <th>Shots (A-H)</th>
              <th>TO (A-H)</th>
              <th>FO% (A-H)</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map(({ game, result }) => {
              const away = teamById.get(game.awayTeamId);
              const home = teamById.get(game.homeTeamId);
              return (
                <tr key={game.id}>
                  <td>{away?.schoolName}</td>
                  <td>{home?.schoolName}</td>
                  <td>{result ? `${result.awayScore}-${result.homeScore}` : 'Scheduled'}</td>
                  <td>{result ? `${result.teamStatsAway.shots}-${result.teamStatsHome.shots}` : '-'}</td>
                  <td>{result ? `${result.teamStatsAway.turnovers}-${result.teamStatsHome.turnovers}` : '-'}</td>
                  <td>{result ? `${result.teamStatsAway.faceoffPct}-${result.teamStatsHome.faceoffPct}` : '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default SeasonWeekPage;
