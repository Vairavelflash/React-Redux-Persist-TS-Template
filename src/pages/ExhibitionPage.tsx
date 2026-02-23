import { FormEvent } from 'react';
import { runExhibition, setSeed, setTactics, setTeams } from '../features/exhibition/exhibitionSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { Tactics } from '../types/sim';

const tempoOptions: Tactics['tempo'][] = ['slow', 'normal', 'fast'];
const rideOptions: Tactics['rideClear'][] = ['conservative', 'balanced', 'aggressive'];
const slideOptions: Tactics['slideAggression'][] = ['early', 'normal', 'late'];

function TacticsControls({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Tactics;
  onChange: (next: Tactics) => void;
}) {
  return (
    <div className="card">
      <h4>{label} Tactics</h4>
      <label>
        Tempo
        <select value={value.tempo} onChange={(event) => onChange({ ...value, tempo: event.target.value as Tactics['tempo'] })}>
          {tempoOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label>
        Ride/Clear
        <select
          value={value.rideClear}
          onChange={(event) => onChange({ ...value, rideClear: event.target.value as Tactics['rideClear'] })}
        >
          {rideOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label>
        Slide Aggression
        <select
          value={value.slideAggression}
          onChange={(event) => onChange({ ...value, slideAggression: event.target.value as Tactics['slideAggression'] })}
        >
          {slideOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function ExhibitionPage() {
  const dispatch = useAppDispatch();
  const teams = useAppSelector((state) => state.league.teams);
  const exhibition = useAppSelector((state) => state.exhibition);

  const teamAId = exhibition.selectedTeamAId ?? teams[0]?.id ?? '';
  const teamBId = exhibition.selectedTeamBId ?? teams[1]?.id ?? '';

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    dispatch(setTeams({ teamAId, teamBId }));
    dispatch(runExhibition());
  };

  return (
    <section>
      <h2>Exhibition Game</h2>
      <form className="card" onSubmit={onSubmit}>
        <div className="grid2">
          <label>
            Team A
            <select
              value={teamAId}
              onChange={(event) => dispatch(setTeams({ teamAId: event.target.value, teamBId }))}
            >
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.schoolName} {team.nickname}
                </option>
              ))}
            </select>
          </label>

          <label>
            Team B
            <select
              value={teamBId}
              onChange={(event) => dispatch(setTeams({ teamAId, teamBId: event.target.value }))}
            >
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.schoolName} {team.nickname}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid2">
          <TacticsControls
            label="Team A"
            value={exhibition.tacticsA}
            onChange={(next) => dispatch(setTactics({ team: 'A', tactics: next }))}
          />
          <TacticsControls
            label="Team B"
            value={exhibition.tacticsB}
            onChange={(next) => dispatch(setTactics({ team: 'B', tactics: next }))}
          />
        </div>

        <div className="seedRow">
          <label>
            Seed
            <input
              type="number"
              value={exhibition.seed}
              onChange={(event) => dispatch(setSeed(Number(event.target.value) || 0))}
            />
          </label>
          <button type="button" onClick={() => dispatch(setSeed(Math.floor(Math.random() * 1000000000)))}>
            Random Seed
          </button>
          <button type="submit">Sim Game</button>
        </div>
      </form>

      {exhibition.lastResult ? (
        <div className="card">
          <h3>
            Final: {exhibition.lastResult.teamAName} {exhibition.lastResult.scoreA} - {exhibition.lastResult.scoreB}{' '}
            {exhibition.lastResult.teamBName}
          </h3>

          <h4>Team Box Score</h4>
          <table>
            <thead>
              <tr>
                <th>Team</th>
                <th>Goals</th>
                <th>Shots</th>
                <th>Saves</th>
                <th>Turnovers</th>
                <th>Ground Balls</th>
                <th>Penalties</th>
                <th>Faceoff%</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{exhibition.lastResult.teamAName}</td>
                <td>{exhibition.lastResult.statsA.goals}</td>
                <td>{exhibition.lastResult.statsA.shots}</td>
                <td>{exhibition.lastResult.statsA.saves}</td>
                <td>{exhibition.lastResult.statsA.turnovers}</td>
                <td>{exhibition.lastResult.statsA.groundBalls}</td>
                <td>{exhibition.lastResult.statsA.penalties}</td>
                <td>{exhibition.lastResult.statsA.faceoffPct}</td>
              </tr>
              <tr>
                <td>{exhibition.lastResult.teamBName}</td>
                <td>{exhibition.lastResult.statsB.goals}</td>
                <td>{exhibition.lastResult.statsB.shots}</td>
                <td>{exhibition.lastResult.statsB.saves}</td>
                <td>{exhibition.lastResult.statsB.turnovers}</td>
                <td>{exhibition.lastResult.statsB.groundBalls}</td>
                <td>{exhibition.lastResult.statsB.penalties}</td>
                <td>{exhibition.lastResult.statsB.faceoffPct}</td>
              </tr>
            </tbody>
          </table>

          <div className="grid2">
            <div>
              <h4>Top Players — {exhibition.lastResult.teamAName}</h4>
              <ul>
                {exhibition.lastResult.topPlayersA.map((player) => (
                  <li key={player.playerId}>
                    {player.name} ({player.position}) — G:{player.goals} A:{player.assists} SV:{player.saves}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Top Players — {exhibition.lastResult.teamBName}</h4>
              <ul>
                {exhibition.lastResult.topPlayersB.map((player) => (
                  <li key={player.playerId}>
                    {player.name} ({player.position}) — G:{player.goals} A:{player.assists} SV:{player.saves}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <h4>Highlights</h4>
          <ul>
            {exhibition.lastResult.highlights.map((line, index) => (
              <li key={`${line}-${index}`}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

export default ExhibitionPage;
