import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  resetSeason,
  selectSeasonHasStarted,
  selectSeasonSummary,
  selectWeekGames,
  simCurrentWeek,
  simSeason,
  startNewSeason,
  startPlayoffs,
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
  const coach = useAppSelector((state) => state.coach);

  const currentWeekForList = Math.min(summary.currentWeekIndex, 11);
  const weekSelector = useMemo(() => selectWeekGames(currentWeekForList), [currentWeekForList]);
  const thisWeekGames = useAppSelector(weekSelector);

  const teamById = useMemo(() => new Map(teams.map((team) => [team.id, team])), [teams]);

  const filteredGames = thisWeekGames.filter(({ game }) => {
    if (conferenceFilter === 'ALL') return true;
    const home = teamById.get(game.homeTeamId);
    const away = teamById.get(game.awayTeamId);
    return home?.conferenceId === conferenceFilter || away?.conferenceId === conferenceFilter;
  });
  const visibleGames = filteredGames.slice(0, 10);

  return (
    <section>
      <div className="sectionHeaderRow">
        <h2>Season Command Center</h2>
        <div className="chipRow">
          <span className="statusChip">WEEKLY OPS</span>
          <span className="statusChip statusChipSoft">{coach.onboardingStep === 'READY' ? 'CAREER LINKED' : 'CAREER NOT SET'}</span>
        </div>
      </div>

      <div className="card">
        <div className="careerStatsGrid">
          <div className="statTile">
            <span className="mutedText">Phase</span>
            <strong>{summary.phase}</strong>
          </div>
          <div className="statTile">
            <span className="mutedText">Week</span>
            <strong>{Math.min(summary.currentWeekIndex + 1, 12)} / 12</strong>
          </div>
          <div className="statTile">
            <span className="mutedText">Completed Weeks</span>
            <strong>{summary.completedWeeks}</strong>
          </div>
          <div className="statTile">
            <span className="mutedText">Season Seed</span>
            <strong>{summary.seasonSeed}</strong>
          </div>
          <div className="statTile">
            <span className="mutedText">Coach Career</span>
            <strong>{coach.onboardingStep === 'READY' ? 'Active' : 'Setup Needed'}</strong>
          </div>
          <div className="statTile">
            <span className="mutedText">Recruiting Week</span>
            <strong>{coach.recruitingWeekIndex + 1}</strong>
          </div>
        </div>

        <div className="seedRow">
          <label>
            Season Seed
            <input
              type="number"
              min={0}
              value={seedInput}
              onChange={(event) => setSeedInput(Math.max(0, Number(event.target.value) || 0))}
            />
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
          <button type="button" onClick={() => dispatch(startPlayoffs())} disabled={summary.phase !== 'PLAYOFF'}>
            Start Playoffs
          </button>
          <button type="button" onClick={() => dispatch(resetSeason())}>
            Reset
          </button>
        </div>

        <p className="mutedText">
          <Link to="/season/standings">Standings</Link> · <Link to="/rankings">Rankings</Link> · <Link to="/playoffs">Playoffs</Link> ·{' '}
          <Link to={`/season/week/${Math.min(summary.currentWeekIndex, 11)}`}>Current Week View</Link> · <Link to="/career">Coach Career</Link>
        </p>
      </div>

      <div className="card">
        <h3>This Week&apos;s Games</h3>
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

        <p className="mutedText">Showing {visibleGames.length} of {filteredGames.length} games for this filter.</p>

        <ul className="plainList compactList">
          {filteredGames.length === 0 ? <li className="mutedText">No games match this conference filter for the selected week.</li> : null}
          {visibleGames.map(({ game, result }) => {
            const home = teamById.get(game.homeTeamId);
            const away = teamById.get(game.awayTeamId);
            return (
              <li key={game.id}>
                {away?.schoolName} at {home?.schoolName}{' '}
                {result ? (
                  <strong>
                    — Final {result.awayScore}-{result.homeScore}
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
