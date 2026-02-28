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

  const displayWeek = Math.min(summary.currentWeekIndex, 11);
  const weekSelector = useMemo(() => selectWeekGames(displayWeek), [displayWeek]);
  const thisWeekGames = useAppSelector(weekSelector);

  const teamById = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);

  const filteredGames = useMemo(() => {
    return thisWeekGames.filter(({ game }) => {
      if (conferenceFilter === 'ALL') return true;
      const home = teamById.get(game.homeTeamId);
      const away = teamById.get(game.awayTeamId);
      return home?.conferenceId === conferenceFilter || away?.conferenceId === conferenceFilter;
    });
  }, [thisWeekGames, conferenceFilter, teamById]);

  const hasValidSeed = Number.isFinite(seedInput);

  const handleStartSeason = () => {
      if (!hasValidSeed) return;
      dispatch(startNewSeason({ seed: seedInput }));
  };

  const handleSimWeek = () => {
      dispatch(simCurrentWeek());
  };

  const handleSimSeason = () => {
      if(confirm("Simulate the rest of the regular season?")) {
        dispatch(simSeason());
      }
  };

  const handleReset = () => {
      if(confirm("Are you sure you want to reset the season? This cannot be undone.")) {
          dispatch(resetSeason());
      }
  };

  if (!hasSeason) {
      return (
          <div className="card max-w-lg mx-auto">
              <h2>Start New Season</h2>
              <p className="mb-4 text-gray-500">Configure your season settings below.</p>

              <div className="flex gap-4 items-end mb-4">
                  <label className="flex-1">
                      <span className="text-sm font-semibold">Season Seed</span>
                      <input
                        type="number"
                        value={seedInput}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.trim() === '') {
                            setSeedInput(Number.NaN);
                            return;
                          }
                          setSeedInput(Number(value));
                        }}
                        className="p-2 border rounded w-full"
                      />
                  </label>
                  <button
                      className="btn"
                      onClick={() => setSeedInput(Math.floor(Math.random() * 10000))}
                  >
                      Random
                  </button>
              </div>

              {!hasValidSeed && (
                <p className="text-sm text-red-600 mt-1">Enter a valid numeric seed to begin.</p>
              )}

              <div className="flex justify-end">
                  <button
                      className="btn btn-primary"
                      onClick={handleStartSeason}
                      disabled={!hasValidSeed}
                  >
                      Begin Season
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="flex-col gap-4">
      <div className="card">
        <div className="flex justify-between items-center mb-4">
            <div>
                <h2 className="m-0 text-xl font-bold">Season Dashboard</h2>
                <div className="text-sm text-gray-500 mt-1">
                    Week {displayWeek + 1} of 12 &bull; {summary.phase} Phase
                </div>
            </div>

            {summary.phase === 'REGULAR' && (
                <div className="flex gap-2">
                     <button
                        className="btn btn-primary"
                        onClick={handleSimWeek}
                     >
                        Sim Week {displayWeek + 1}
                     </button>
                     <button
                        className="btn"
                        onClick={handleSimSeason}
                     >
                        Sim To End
                     </button>
                </div>
            )}
             {summary.phase !== 'REGULAR' && (
                 <div className="flex gap-2">
                     <Link to="/playoffs" className="btn btn-primary">Go to Playoffs</Link>
                 </div>
             )}
        </div>

        <div className="flex gap-2 text-sm mt-4 border-t pt-2">
             <Link to="/season/standings" className="text-blue-600 hover:underline">View Standings</Link>
             <span>&bull;</span>
             <Link to={`/season/week/${displayWeek}`} className="text-blue-600 hover:underline">Full Weekly Schedule</Link>
             <span>&bull;</span>
             <button onClick={handleReset} className="text-red-600 hover:underline bg-transparent border-0 cursor-pointer p-0 ml-auto">
                 Reset Season
             </button>
        </div>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="m-0 text-lg font-semibold">Week {displayWeek + 1} Matchups</h3>
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
        </div>

        <div className="flex-col gap-2">
          {filteredGames.slice(0, 10).map(({ game, result }) => {
            const home = teamById.get(game.homeTeamId);
            const away = teamById.get(game.awayTeamId);
            return (
              <div key={game.id} className="p-2 border-b border-gray-100 flex justify-between items-center hover:bg-gray-50">
                <div className="flex-1 text-right">
                    <span className="font-semibold">{away?.schoolName}</span>
                    <span className="text-xs text-gray-500 ml-1">({away?.nickname})</span>
                </div>
                <div className="mx-4 font-mono font-bold text-lg min-w-[60px] text-center">
                    {result ? (
                        <span>{result.scoreB} - {result.scoreA}</span>
                    ) : (
                        <span className="text-gray-400 text-sm">vs</span>
                    )}
                </div>
                <div className="flex-1 text-left">
                    <span className="font-semibold">{home?.schoolName}</span>
                    <span className="text-xs text-gray-500 ml-1">({home?.nickname})</span>
                </div>
              </div>
            );
          })}

          {filteredGames.length === 0 && (
              <p className="text-center text-gray-500 py-4">No games found for this filter.</p>
          )}

          {filteredGames.length > 10 && (
             <div className="text-center mt-2 p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100">
                 <Link to={`/season/week/${displayWeek}`} className="text-sm text-blue-600 font-semibold block">
                    View all {filteredGames.length} games for Week {displayWeek + 1} &rarr;
                 </Link>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SeasonPage;
