import { useMemo } from 'react';
import { simNextPlayoffRound, selectPlayoffState, startPlayoffs } from '../features/season/seasonSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

function PlayoffsPage() {
  const dispatch = useAppDispatch();
  const playoffState = useAppSelector(selectPlayoffState);
  const phase = useAppSelector((state) => state.season.phase);
  const teams = useAppSelector((state) => state.league.teams);
  const teamById = useMemo(() => new Map(teams.map((team) => [team.id, team])), [teams]);

  return (
    <section>
      <h2>Playoff Bracket</h2>
      <div className="card">
        <p>
          Phase: <strong>{phase}</strong>
        </p>
        <div className="seedRow">
          <button type="button" onClick={() => dispatch(startPlayoffs())} disabled={phase !== 'PLAYOFF' || !!playoffState}>
            Start Playoffs
          </button>
          <button type="button" onClick={() => dispatch(simNextPlayoffRound())} disabled={phase !== 'PLAYOFF' || !playoffState}>
            Sim Next Round
          </button>
        </div>
      </div>

      {playoffState ? (
        <>
          <div className="card">
            <h3>Seeds</h3>
            <ol>
              {playoffState.seeds.map((seed) => (
                <li key={seed.teamId}>
                  #{seed.seed} {teamById.get(seed.teamId)?.schoolName} {teamById.get(seed.teamId)?.nickname}
                </li>
              ))}
            </ol>
          </div>

          {(['ROUND1', 'QUARTERFINAL', 'SEMIFINAL', 'FINAL'] as const).map((round) => {
            const games = playoffState.rounds[round];
            return (
              <div key={round} className="card">
                <h3>{round}</h3>
                {games.length === 0 ? (
                  <p>Waiting for prior round.</p>
                ) : (
                  <ul>
                    {games.map((game) => {
                      const home = teamById.get(game.homeTeamId);
                      const away = teamById.get(game.awayTeamId);
                      return (
                        <li key={game.id}>
                          {away?.schoolName} at {home?.schoolName}{' '}
                          {game.result ? `— ${game.result.awayScore}-${game.result.homeScore}` : '— Scheduled'}
                          {game.winnerTeamId ? ` (Winner: ${teamById.get(game.winnerTeamId)?.schoolName})` : ''}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}

          {playoffState.championTeamId ? (
            <div className="card">
              <h3>
                Champion: {teamById.get(playoffState.championTeamId)?.schoolName} {teamById.get(playoffState.championTeamId)?.nickname}
              </h3>
            </div>
          ) : null}
        </>
      ) : (
        <div className="card">
          <p>Sim to end of regular season, then click Start Playoffs.</p>
        </div>
      )}
    </section>
  );
}

export default PlayoffsPage;
