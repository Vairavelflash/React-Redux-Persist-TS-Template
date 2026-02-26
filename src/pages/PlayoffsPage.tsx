import { simNextPlayoffRound, selectPlayoffState, startPlayoffs, selectSeasonSummary } from '../features/season/seasonSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { PlayoffRoundName } from '../types/sim';

const ROUND_LABELS: Record<PlayoffRoundName, string> = {
    'ROUND1': 'First Round',
    'QUARTERFINAL': 'Quarterfinals',
    'SEMIFINAL': 'Semifinals',
    'FINAL': 'Championship'
};

function PlayoffsPage() {
  const dispatch = useAppDispatch();
  const summary = useAppSelector(selectSeasonSummary);
  const playoffState = useAppSelector(selectPlayoffState);
  const teams = useAppSelector((state) => state.league.teams);
  const teamById = new Map(teams.map((team) => [team.id, team]));

  const canStart = summary.phase === 'PLAYOFF' && !playoffState;
  const canSim = summary.phase === 'PLAYOFF' && !!playoffState && !playoffState.championTeamId;
  const isComplete = !!playoffState?.championTeamId;

  if (summary.phase === 'REGULAR' || summary.phase === 'PRE') {
      return (
          <div className="card text-center py-8">
              <h2>Playoffs Not Started</h2>
              <p className="text-gray-500 mb-4">Complete the regular season to unlock the post-season bracket.</p>
              <p>Current Week: {summary.currentWeekIndex + 1} / 12</p>
          </div>
      );
  }

  return (
    <div className="flex-col gap-4">
      <div className="card flex justify-between items-center">
        <div>
            <h2 className="m-0">NCAA Tournament</h2>
            <div className="text-sm text-gray-500 mt-1">
                {isComplete ? 'Tournament Complete' : `Current Round: ${playoffState ? ROUND_LABELS[playoffState.currentRound] : 'Selections'}`}
            </div>
        </div>

        <div>
            {canStart && (
                <button className="btn btn-primary" onClick={() => dispatch(startPlayoffs())}>
                    Initialize Bracket
                </button>
            )}
            {canSim && (
                <button className="btn btn-primary" onClick={() => dispatch(simNextPlayoffRound())}>
                    Simulate {ROUND_LABELS[playoffState!.currentRound]}
                </button>
            )}
            {isComplete && (
                <div className="text-green-600 font-bold px-4 py-2 bg-green-50 rounded">
                    Season Complete
                </div>
            )}
        </div>
      </div>

      {playoffState && (
        <div className="grid2" style={{ gridTemplateColumns: '300px 1fr' }}>
             <div className="card">
                <h3>Seeding</h3>
                <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 border-b">
                                <th className="pb-2">Seed</th>
                                <th className="pb-2">Team</th>
                            </tr>
                        </thead>
                        <tbody>
                            {playoffState.seeds.map((seed) => (
                                <tr key={seed.teamId} className="border-b last:border-0">
                                    <td className="py-2 font-mono font-bold text-center w-12">#{seed.seed}</td>
                                    <td className="py-2">
                                        <div className="font-semibold">{teamById.get(seed.teamId)?.schoolName}</div>
                                        <div className="text-xs text-gray-500">{teamById.get(seed.teamId)?.nickname}</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex-col gap-4">
                {(['ROUND1', 'QUARTERFINAL', 'SEMIFINAL', 'FINAL'] as const).map((round) => {
                    const games = playoffState.rounds[round];
                    if (games.length === 0) return null;

                    return (
                        <div key={round} className="card">
                            <h3 className="text-lg font-bold border-b pb-2 mb-2">{ROUND_LABELS[round]}</h3>
                            <div className="grid2 gap-2">
                                {games.map((game) => {
                                    const home = teamById.get(game.homeTeamId);
                                    const away = teamById.get(game.awayTeamId);
                                    const winnerId = game.winnerTeamId;

                                    return (
                                        <div key={game.id} className="border rounded p-2 text-sm bg-gray-50">
                                            <div className={`flex justify-between items-center ${winnerId === game.awayTeamId ? 'font-bold text-black' : 'text-gray-600'}`}>
                                                <span>{game.awaySeed > 0 && <span className="text-xs text-gray-400 mr-1">#{game.awaySeed}</span>}{away?.schoolName}</span>
                                                <span>{game.result?.awayScore}</span>
                                            </div>
                                            <div className={`flex justify-between items-center ${winnerId === game.homeTeamId ? 'font-bold text-black' : 'text-gray-600'}`}>
                                                <span>{game.homeSeed > 0 && <span className="text-xs text-gray-400 mr-1">#{game.homeSeed}</span>}{home?.schoolName}</span>
                                                <span>{game.result?.homeScore}</span>
                                            </div>
                                            {!game.result && (
                                                <div className="text-center text-xs text-gray-400 mt-1">Scheduled</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      )}

      {isComplete && playoffState?.championTeamId && (
          <div className="card text-center bg-yellow-50 border-yellow-500 mt-4">
              <h2>🏆 National Champion 🏆</h2>
              <div className="text-2xl font-bold mb-2">
                  {teamById.get(playoffState.championTeamId)?.schoolName} {teamById.get(playoffState.championTeamId)?.nickname}
              </div>
          </div>
      )}
    </div>
  );
}

export default PlayoffsPage;
