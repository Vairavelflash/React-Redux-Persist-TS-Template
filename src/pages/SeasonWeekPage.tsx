import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { selectWeekGames } from '../features/season/seasonSlice';
import { buildGameRecap } from '../sim/gameRecap';
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
  const [teamQuery, setTeamQuery] = useState('');
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  const teamById = useMemo(() => new Map(teams.map((team) => [team.id, team])), [teams]);

  const displayed = rows
    .filter(({ game }) => {
      if (conferenceFilter === 'ALL') return true;
      const home = teamById.get(game.homeTeamId);
      const away = teamById.get(game.awayTeamId);
      return home?.conferenceId === conferenceFilter || away?.conferenceId === conferenceFilter;
    })
    .filter(({ game }) => {
      if (!teamQuery.trim()) return true;
      const query = teamQuery.toLowerCase();
      const home = teamById.get(game.homeTeamId)?.schoolName.toLowerCase() ?? '';
      const away = teamById.get(game.awayTeamId)?.schoolName.toLowerCase() ?? '';
      return home.includes(query) || away.includes(query);
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

  const completedCount = displayed.filter((row) => row.result).length;
  const selected = displayed.find((row) => row.game.id === selectedGameId) ?? null;
  const recapCards = displayed
    .filter((row): row is typeof row & { result: NonNullable<typeof row.result> } => Boolean(row.result))
    .slice(0, 8)
    .map(({ game, result }) => {
      const away = teamById.get(game.awayTeamId)?.schoolName ?? 'Away';
      const home = teamById.get(game.homeTeamId)?.schoolName ?? 'Home';
      return buildGameRecap(result, away, home);
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
            Team search
            <input value={teamQuery} onChange={(event) => setTeamQuery(event.target.value)} placeholder="Search team name" />
          </label>

          <label>
            Sort
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value as 'alpha' | 'score')}>
              <option value="alpha">Home Team A-Z</option>
              <option value="score">Highest Total Score</option>
            </select>
          </label>
        </div>

        <p className="mutedText">
          Showing <strong>{displayed.length}</strong> games · Final <strong>{completedCount}</strong> / {displayed.length}
        </p>

        <table>
          <thead>
            <tr>
              <th>Away</th>
              <th>Home</th>
              <th>Score</th>
              <th>Shots (A-H)</th>
              <th>TO (A-H)</th>
              <th>FO% (A-H)</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map(({ game, result }) => {
              const away = teamById.get(game.awayTeamId);
              const home = teamById.get(game.homeTeamId);
              return (
                <tr key={game.id} className={selectedGameId === game.id ? 'selectedTableRow' : ''}>
                  <td>{away?.schoolName}</td>
                  <td>{home?.schoolName}</td>
                  <td>{result ? `${result.awayScore}-${result.homeScore}` : 'Scheduled'}</td>
                  <td>{result ? `${result.teamStatsAway.shots}-${result.teamStatsHome.shots}` : '-'}</td>
                  <td>{result ? `${result.teamStatsAway.turnovers}-${result.teamStatsHome.turnovers}` : '-'}</td>
                  <td>{result ? `${result.teamStatsAway.faceoffPct}-${result.teamStatsHome.faceoffPct}` : '-'}</td>
                  <td>
                    <button type="button" onClick={() => setSelectedGameId(game.id)} disabled={!result}>
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected?.result ? (
        <div className="card">
          <div className="detailHeaderRow">
            <h3>Game Detail</h3>
            <button type="button" onClick={() => setSelectedGameId(null)}>
              Close
            </button>
          </div>
          <p>
            {teamById.get(selected.game.awayTeamId)?.schoolName} {selected.result.awayScore} at {teamById.get(selected.game.homeTeamId)?.schoolName}{' '}
            {selected.result.homeScore}
          </p>
          <p>
            Saves: {selected.result.teamStatsAway.saves}-{selected.result.teamStatsHome.saves} · Ground Balls:{' '}
            {selected.result.teamStatsAway.groundBalls}-{selected.result.teamStatsHome.groundBalls} · Penalties:{' '}
            {selected.result.teamStatsAway.penalties}-{selected.result.teamStatsHome.penalties}
          </p>
          {selected.result.topPerformers?.length ? (
            <ul>
              {selected.result.topPerformers.map((player) => (
                <li key={player.playerId}>
                  {player.name} ({player.position}) — G:{player.goals} A:{player.assists} SV:{player.saves}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {recapCards.length > 0 ? (
        <div className="card">
          <h3>Week Recap</h3>
          <div className="recapGrid">
            {recapCards.map((recap) => (
              <article key={recap.gameId} className="recapCard">
                <p className="recapSummary">{recap.summary}</p>
                <p>{recap.keyEdge}</p>
                <p className="mutedText">{recap.efficiencyNote}</p>
                <p>
                  <strong>MVP:</strong>{' '}
                  {recap.mvp ? `${recap.mvp.name} (${recap.mvp.position}) G:${recap.mvp.goals} A:${recap.mvp.assists} SV:${recap.mvp.saves}` : 'N/A'}
                </p>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className="card">
          <p className="mutedText">No completed games for this filter yet. Sim this week from the Season page to generate recaps.</p>
        </div>
      )}
    </section>
  );
}

export default SeasonWeekPage;
