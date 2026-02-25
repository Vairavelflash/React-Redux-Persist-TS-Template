import { useMemo, useState } from 'react';
import { selectConferenceStandings, selectOverallStandings } from '../features/season/seasonSlice';
import { useAppSelector } from '../store/hooks';

function SeasonStandingsPage() {
  const conferences = useAppSelector((state) => state.league.conferences);
  const [conferenceId, setConferenceId] = useState(conferences[0]?.id ?? '');

  const overall = useAppSelector(selectOverallStandings);
  const conferenceSelector = useMemo(() => selectConferenceStandings(conferenceId), [conferenceId]);
  const conferenceRows = useAppSelector(conferenceSelector);

  return (
    <section>
      <h2>Standings</h2>
      <div className="card">
        <h3>Conference Standings</h3>
        <label>
          Conference
          <select value={conferenceId} onChange={(event) => setConferenceId(event.target.value)}>
            {conferences.map((conference) => (
              <option key={conference.id} value={conference.id}>
                {conference.name}
              </option>
            ))}
          </select>
        </label>

        <div className="scrollPanel">
          <table>
            <thead>
              <tr>
                <th>Team</th>
                <th>Conf</th>
                <th>Overall</th>
                <th>PF</th>
                <th>PA</th>
                <th>Diff</th>
              </tr>
            </thead>
            <tbody>
              {conferenceRows.map((row) => (
                <tr key={row.team.id}>
                  <td>
                    {row.team.schoolName} {row.team.nickname}
                  </td>
                  <td>
                    {row.record.confWins}-{row.record.confLosses}
                  </td>
                  <td>
                    {row.record.wins}-{row.record.losses}
                  </td>
                  <td>{row.record.pointsFor}</td>
                  <td>{row.record.pointsAgainst}</td>
                  <td>{row.record.pointsFor - row.record.pointsAgainst}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3>Overall Standings</h3>
        <div className="scrollPanel">
          <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Team</th>
              <th>W-L</th>
              <th>Conf</th>
              <th>Diff</th>
            </tr>
          </thead>
          <tbody>
            {overall.map((row, index) => (
              <tr key={row.team.id}>
                <td>{index + 1}</td>
                <td>
                  {row.team.schoolName} {row.team.nickname}
                </td>
                <td>
                  {row.record.wins}-{row.record.losses}
                </td>
                <td>
                  {row.record.confWins}-{row.record.confLosses}
                </td>
                <td>{row.pointDiff}</td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default SeasonStandingsPage;
