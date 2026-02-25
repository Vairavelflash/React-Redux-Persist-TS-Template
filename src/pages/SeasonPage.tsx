import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  selectSeasonHasStarted,
  selectSeasonSummary,
  selectWeekGames,
  simCurrentWeek,
  simSeason,
  startNewSeason,
  resetSeason,
} from '../features/season/seasonSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

function SeasonPage() {
  const dispatch = useAppDispatch();
  const [seedInput, setSeedInput] = useState(2026);
  const [conferenceFilter, setConferenceFilter] = useState('ALL');
  const summary = useAppSelector(selectSeasonSummary);
  const hasSeason = useAppSelector(selectSeasonHasStarted);
  const teams = useAppSelector((state) => state.league.teams);
  const conferences = useAppSelector((state) => state.league.conferences);

  const currentWeekForList = Math.min(summary.currentWeekIndex, 11);
  const weekSelector = useMemo(() => selectWeekGames(currentWeekForList), [currentWeekForList]);
  const thisWeekGames = useAppSelector(weekSelector);

  const filteredGames = thisWeekGames.filter(({ game }) => {
    if (conferenceFilter === 'ALL') return true;
    const home = teams.find((t) => t.id === game.homeTeamId);
    const away = teams.find((t) => t.id === game.awayTeamId);
    return home?.conferenceId === conferenceFilter || away?.conferenceId === conferenceFilter;
  });

  const teamById = useMemo(() => new Map(teams.map((team) => [team.id, team])), [teams]);

  return (
    <section>
      <h2>Season Dashboard</h2>
      <div className="card">
        <div className="seedRow">
          <label>
            Season Seed
            <input type="number" value={seedInput} onChange={(event) => setSeedInput(Number(event.target.value) || 0)} />
          </label>
          <button type="button" onClick={() => setSeedInput(Math.floor(Math.random() * 1_000_000_000))}>
            Random Seed
          </button>
          <button type="button" onClick={() => dispatch(startNewSeason({ seed: seedInput }))}>
            Start New Season
          </button>
          <button type="button" onClick={() => dispatch(simCurrentWeek())} disabled={!hasSeason || summary.currentWeekIndex >= 12}>
            Sim Week
          </button>
          <button type="button" onClick={() => dispatch(simSeason())} disabled={!hasSeason || summary.currentWeekIndex >= 12}>
            Sim Season
          </button>
          <button type="button" onClick={() => dispatch(resetSeason())}>
            Reset
          </button>
        </div>

        <p>
          Phase: <strong>{summary.phase}</strong> · Week: <strong>{Math.min(summary.currentWeekIndex + 1, 12)} / 12</strong> · Completed Weeks:{' '}
          <strong>{summary.completedWeeks}</strong> · Seed: <strong>{summary.seasonSeed}</strong>
        </p>

        <p>
          <Link to="/season/standings">Go to Standings</Link> ·{' '}
          <Link to={`/season/week/${Math.min(summary.currentWeekIndex, 11)}`}>Go to Current Week View</Link>
        </p>
      </div>

      <div className="card">
        <h3>This Week's Games</h3>
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

        <ul>
          {filteredGames.slice(0, 10).map(({ game, result }) => {
            const home = teamById.get(game.homeTeamId);
            const away = teamById.get(game.awayTeamId);
            return (
              <li key={game.id}>
                {away?.schoolName} at {home?.schoolName}{' '}
                {result ? (
                  <strong>
                    — Final {result.scoreB}-{result.scoreA}
                  </strong>
                ) : (
                  <span>— Scheduled</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export default SeasonPage;
