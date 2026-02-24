import { Link } from 'react-router-dom';
import { simNextPlayoffRound, selectPlayoffState, startPlayoffs } from '../features/season/seasonSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

const BRACKET_ROUNDS = ['ROUND1', 'QUARTERFINAL', 'SEMIFINAL', 'FINAL'] as const;

const ROUND_LABELS: Record<(typeof BRACKET_ROUNDS)[number], string> = {
  ROUND1: 'Round 1',
  QUARTERFINAL: 'Quarterfinals',
  SEMIFINAL: 'Semifinals',
  FINAL: 'Final',
};

function PlayoffsPage() {
  const dispatch = useAppDispatch();
  const playoffState = useAppSelector(selectPlayoffState);
  const phase = useAppSelector((state) => state.season.phase);
  const teams = useAppSelector((state) => state.league.teams);
  const teamById = new Map(teams.map((team) => [team.id, team]));
  const seedByTeamId = new Map(playoffState?.seeds.map((seed) => [seed.teamId, seed.seed]) ?? []);

  const completedRounds = playoffState
    ? BRACKET_ROUNDS.filter((round) => playoffState.rounds[round].length > 0 && playoffState.rounds[round].every((game) => Boolean(game.result))).length
    : 0;
  const totalRounds = BRACKET_ROUNDS.length;

  return (
    <section>
      <h2>Playoff Bracket</h2>
      <div className="card">
        <p>
          Phase: <strong>{phase}</strong>
        </p>
        {playoffState ? (
          <>
            <p>
              Current Round: <strong>{ROUND_LABELS[playoffState.currentRound]}</strong> · Progress: <strong>{completedRounds}</strong> / {totalRounds}
            </p>
            <div className="timelineRow" aria-label="Playoff progression timeline">
              {BRACKET_ROUNDS.map((round) => {
                const hasGames = playoffState.rounds[round].length > 0;
                const completed = hasGames && playoffState.rounds[round].every((game) => Boolean(game.result));
                const active = round === playoffState.currentRound && !completed;
                return (
                  <span key={round} className={`timelinePill ${completed ? 'done' : ''} ${active ? 'active' : ''}`}>
                    {ROUND_LABELS[round]}
                  </span>
                );
              })}
            </div>
          </>
        ) : (
          <p className="mutedText">No playoff bracket yet. Finish the regular season then start playoffs.</p>
        )}

        <div className="seedRow">
          <button type="button" onClick={() => dispatch(startPlayoffs())} disabled={phase !== 'PLAYOFF' || !!playoffState}>
            Start Playoffs
          </button>
          <button type="button" onClick={() => dispatch(simNextPlayoffRound())} disabled={phase !== 'PLAYOFF' || !playoffState}>
            Sim Next Round
          </button>
          <Link to="/rankings">View Selection Rankings</Link>
        </div>
      </div>

      {playoffState ? (
        <>
          <div className="card">
            <h3 id="projected-seeds">Seeds</h3>
            <ol>
              {playoffState.seeds.map((seed) => (
                <li key={seed.teamId}>
                  #{seed.seed} {teamById.get(seed.teamId)?.schoolName} {teamById.get(seed.teamId)?.nickname}
                </li>
              ))}
            </ol>
          </div>

          <div className="card">
            <h3>Bracket</h3>
            <div className="bracketGrid" aria-label="Playoff bracket visualization">
              {BRACKET_ROUNDS.map((round) => {
                const games = playoffState.rounds[round];
                return (
                  <section key={round} className="bracketRound" aria-label={ROUND_LABELS[round]}>
                    <h4>{ROUND_LABELS[round]}</h4>
                    {games.length === 0 ? (
                      <p className="mutedText">Waiting for prior round.</p>
                    ) : (
                      games.map((game) => {
                        const home = teamById.get(game.homeTeamId);
                        const away = teamById.get(game.awayTeamId);
                        const awayWon = game.winnerTeamId === game.awayTeamId;
                        const homeWon = game.winnerTeamId === game.homeTeamId;

                        return (
                          <article key={game.id} className="bracketGameCard">
                            <p className="gameMeta">{game.id}</p>
                            <div className={`bracketTeamRow ${awayWon ? 'winner' : ''}`}>
                              <span className="bracketTeamName">
                                <em className="seedBadge">#{seedByTeamId.get(game.awayTeamId) ?? '?'}</em>
                                {away ? `${away.schoolName} ${away.nickname}` : 'TBD'}
                              </span>
                              <strong>{game.result ? game.result.awayScore : '-'}</strong>
                            </div>
                            <div className={`bracketTeamRow ${homeWon ? 'winner' : ''}`}>
                              <span className="bracketTeamName">
                                <em className="seedBadge">#{seedByTeamId.get(game.homeTeamId) ?? '?'}</em>
                                {home ? `${home.schoolName} ${home.nickname}` : 'TBD'}
                              </span>
                              <strong>{game.result ? game.result.homeScore : '-'}</strong>
                            </div>
                            <p className="gameStatus">{game.result ? 'Final' : 'Scheduled'}</p>
                          </article>
                        );
                      })
                    )}
                  </section>
                );
              })}
            </div>
          </div>

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
          <p>
            Sim to end of regular season, then click Start Playoffs. You can preview likely entrants from <Link to="/rankings">Rankings</Link>.
          </p>
        </div>
      )}
    </section>
  );
}

export default PlayoffsPage;
