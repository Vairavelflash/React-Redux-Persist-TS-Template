import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { selectWeekGames } from '../features/season/seasonSlice';
import { useAppSelector } from '../store/hooks';

function SeasonWeekPage() {
  const { weekIndex } = useParams();
  const navigate = useNavigate();
  // Ensure we parse weekIndex correctly
  const rawIndex = Number(weekIndex ?? 0);
  const weekNum = isNaN(rawIndex) ? 0 : rawIndex;
  const displayWeek = Math.max(0, Math.min(11, weekNum));

  // Selector for games
  const selector = useMemo(() => selectWeekGames(displayWeek), [displayWeek]);
  const rows = useAppSelector(selector);

  const teams = useAppSelector((state) => state.league.teams);
  const conferences = useAppSelector((state) => state.league.conferences);
  const [conferenceFilter, setConferenceFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'alpha' | 'score'>('alpha');

  const teamById = useMemo(() => new Map(teams.map((team) => [team.id, team])), [teams]);

  // Derived state for filtered games
  const displayedGames = useMemo(() => {
      const games = rows.filter(({ game }) => {
          if (conferenceFilter === 'ALL') return true;
          const home = teamById.get(game.homeTeamId);
          const away = teamById.get(game.awayTeamId);
          return home?.conferenceId === conferenceFilter || away?.conferenceId === conferenceFilter;
      });

      return games.sort((a, b) => {
          if (sortBy === 'score') {
             // Total score sort (descending)
             const aScore = (a.result?.scoreA ?? 0) + (a.result?.scoreB ?? 0);
             const bScore = (b.result?.scoreA ?? 0) + (b.result?.scoreB ?? 0);
             return bScore - aScore;
          }
          // Alpha sort by Home Team Name
          const aName = teamById.get(a.game.homeTeamId)?.schoolName ?? '';
          const bName = teamById.get(b.game.homeTeamId)?.schoolName ?? '';
          return aName.localeCompare(bName);
      });
  }, [rows, conferenceFilter, sortBy, teamById]);

  return (
    <div className="flex-col gap-4">
      <div className="card flex justify-between items-center">
         <div className="flex items-center gap-4">
             <button
                className="btn"
                disabled={displayWeek <= 0}
                onClick={() => navigate(`/season/week/${displayWeek - 1}`)}
             >
                 &larr;
             </button>
             <h2 className="m-0">Week {displayWeek + 1}</h2>
             <button
                className="btn"
                disabled={displayWeek >= 11}
                onClick={() => navigate(`/season/week/${displayWeek + 1}`)}
             >
                 &rarr;
             </button>
         </div>

         <div className="flex gap-2">
            <select
                value={conferenceFilter}
                onChange={(e) => setConferenceFilter(e.target.value)}
                className="p-1 text-sm border rounded"
            >
              <option value="ALL">All Conferences</option>
              {conferences.map((conf) => (
                <option key={conf.id} value={conf.id}>
                  {conf.name}
                </option>
              ))}
            </select>

            <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'alpha' | 'score')}
                className="p-1 text-sm border rounded"
            >
              <option value="alpha">Sort: Home A-Z</option>
              <option value="score">Sort: High Score</option>
            </select>
         </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 border-b">
                <tr>
                  <th className="p-2 text-right w-1/4">Away</th>
                  <th className="p-2 text-center w-20">Score</th>
                  <th className="p-2 text-left w-1/4">Home</th>
                  <th className="p-2 text-center text-xs">Shots</th>
                  <th className="p-2 text-center text-xs">TO</th>
                  <th className="p-2 text-center text-xs">FO%</th>
                </tr>
              </thead>
              <tbody>
                {displayedGames.map(({ game, result }) => {
                  const away = teamById.get(game.awayTeamId);
                  const home = teamById.get(game.homeTeamId);
                  const awayScore = result?.scoreB ?? 0;
                  const homeScore = result?.scoreA ?? 0;
                  const isFinal = !!result;

                  return (
                    <tr key={game.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className={`p-2 text-right ${awayScore > homeScore ? 'font-bold' : ''}`}>
                          {away?.schoolName} <span className="text-xs text-gray-500 font-normal">({away?.nickname})</span>
                      </td>
                      <td className="p-2 text-center font-mono font-bold bg-gray-50">
                          {isFinal ? `${awayScore} - ${homeScore}` : 'vs'}
                      </td>
                      <td className={`p-2 text-left ${homeScore > awayScore ? 'font-bold' : ''}`}>
                          {home?.schoolName} <span className="text-xs text-gray-500 font-normal">({home?.nickname})</span>
                      </td>
                      <td className="p-2 text-center text-xs text-gray-600">
                          {isFinal ? `${result.statsB.shots} - ${result.statsA.shots}` : '-'}
                      </td>
                      <td className="p-2 text-center text-xs text-gray-600">
                          {isFinal ? `${result.statsB.turnovers} - ${result.statsA.turnovers}` : '-'}
                      </td>
                      <td className="p-2 text-center text-xs text-gray-600">
                          {isFinal ? `${result.statsB.faceoffPct}% - ${result.statsA.faceoffPct}%` : '-'}
                      </td>
                    </tr>
                  );
                })}
                {displayedGames.length === 0 && (
                    <tr>
                        <td colSpan={6} className="p-4 text-center text-gray-500">No games found.</td>
                    </tr>
                )}
              </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}

export default SeasonWeekPage;
