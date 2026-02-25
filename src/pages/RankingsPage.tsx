import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { selectNextFourOut, selectResumeByTeam, selectTop12Projection, selectTop25Rankings } from '../features/season/seasonSlice';
import { useAppSelector } from '../store/hooks';

function RankingsPage() {
  const top25 = useAppSelector(selectTop25Rankings);
  const top12 = useAppSelector(selectTop12Projection);
  const nextFourOut = useAppSelector(selectNextFourOut);
  const resumeByTeam = useAppSelector(selectResumeByTeam);
  const teams = useAppSelector((state) => state.league.teams);
  const recordsByTeamId = useAppSelector((state) => state.season.recordsByTeamId);

  const teamById = useMemo(() => new Map(teams.map((team) => [team.id, team])), [teams]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');

  const selectedTopRow = top25.find((row) => row.teamId === selectedTeamId) ?? top25[0] ?? null;
  const selectedTeam = selectedTopRow ? teamById.get(selectedTopRow.teamId) : null;
  const selectedResume = selectedTopRow ? resumeByTeam[selectedTopRow.teamId] : null;
  const selectedRecord = selectedTopRow ? recordsByTeamId[selectedTopRow.teamId] : null;
  const selectedPointDiff = selectedRecord ? selectedRecord.pointsFor - selectedRecord.pointsAgainst : 0;

  return (
    <section>
      <h2>Rankings</h2>
      <div className="card">
        <h3>Top 12 Playoff Projection</h3>
        <p className="mutedText">
          Projection updates weekly. Once playoffs start, this list maps directly into the seed list. <Link to="/playoffs#projected-seeds">View Playoff Seeds</Link>
        </p>
        <div className="scrollPanelList">
          <ol>
            {top12.map((row) => {
              const team = teamById.get(row.teamId);
              const resume = resumeByTeam[row.teamId];
              return (
                <li key={row.teamId}>
                  #{row.rank} {team?.schoolName} {team?.nickname} ({row.record}) · SOS {(resume?.sos ?? 0).toFixed(3)} · QW {resume?.qualityWins ?? 0}
                </li>
              );
            })}
          </ol>
        </div>

        <h4>Next Four Out</h4>
        <div className="scrollPanelList">
          <ul>
            {nextFourOut.map((row) => {
              const team = teamById.get(row.teamId);
              return (
                <li key={row.teamId}>
                  {team?.schoolName} {team?.nickname} ({row.record})
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="card">
        <h3>Why This Rank</h3>
        <label>
          Team
          <select value={selectedTopRow?.teamId ?? ''} onChange={(event) => setSelectedTeamId(event.target.value)} disabled={top25.length === 0}>
            {top25.map((row) => {
              const team = teamById.get(row.teamId);
              return (
                <option key={row.teamId} value={row.teamId}>
                  #{row.rank} {team?.schoolName} {team?.nickname}
                </option>
              );
            })}
          </select>
        </label>

        {selectedTopRow && selectedTeam && selectedResume ? (
          <ul>
            <li>
              <strong>Composite Rank:</strong> #{selectedTopRow.rank} ({selectedTopRow.record})
            </li>
            <li>
              <strong>Strength of Schedule:</strong> {selectedResume.sos.toFixed(3)}
            </li>
            <li>
              <strong>Quality Wins:</strong> {selectedResume.qualityWins} (including {selectedResume.eliteWins} elite wins)
            </li>
            <li>
              <strong>Bad Losses:</strong> {selectedResume.badLosses}
            </li>
            <li>
              <strong>Point Differential:</strong> {selectedPointDiff > 0 ? '+' : ''}
              {selectedPointDiff}
            </li>
          </ul>
        ) : (
          <p className="mutedText">Sim games to generate ranking evidence.</p>
        )}
      </div>

      <div className="card">
        <h3>Top 25</h3>
        <div className="scrollPanel">
          <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Team</th>
              <th>Record</th>
              <th>SOS</th>
              <th>QW</th>
              <th>EW</th>
              <th>BL</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {top25.map((row) => {
              const team = teamById.get(row.teamId);
              const resume = resumeByTeam[row.teamId];
              return (
                <tr key={row.teamId}>
                  <td>{row.rank}</td>
                  <td>
                    {team?.schoolName} {team?.nickname}
                  </td>
                  <td>{row.record}</td>
                  <td>{(resume?.sos ?? 0).toFixed(3)}</td>
                  <td>{resume?.qualityWins ?? 0}</td>
                  <td>{resume?.eliteWins ?? 0}</td>
                  <td>{resume?.badLosses ?? 0}</td>
                  <td>{row.points}</td>
                </tr>
              );
            })}
          </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default RankingsPage;
