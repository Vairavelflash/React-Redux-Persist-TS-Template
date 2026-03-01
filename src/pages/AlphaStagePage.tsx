import { Link } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { selectSeasonHasStarted, selectSeasonSummary, selectTop12Projection, selectTop25Rankings } from '../features/season/seasonSlice';

const alphaChecklist = [
  {
    area: 'Core League Foundation',
    status: 'complete',
    details: '128-team league structure, conference browsing, and deterministic roster summaries are in place.',
  },
  {
    area: 'Season Loop (Regular Season)',
    status: 'complete',
    details: '12-week schedule generation, week simulation, and standings updates are playable.',
  },
  {
    area: 'Postseason Loop',
    status: 'in-progress',
    details: 'Top-12 projection and playoff bracket simulation exist, but final balancing and UX polish are still needed.',
  },
  {
    area: 'Coach Layer',
    status: 'in-progress',
    details: 'Coach career setup and recruiting scaffolds exist, but deeper strategy systems are not finalized.',
  },
  {
    area: 'Alpha UX + Quality Bar',
    status: 'in-progress',
    details: 'Ranking transparency shipped; continue game detail depth, responsiveness, and regression test coverage.',
  },
] as const;

function AlphaStagePage() {
  const completed = alphaChecklist.filter((item) => item.status === 'complete').length;
  const progressPct = Math.round((completed / alphaChecklist.length) * 100);

  const seasonHasStarted = useAppSelector(selectSeasonHasStarted);
  const seasonSummary = useAppSelector(selectSeasonSummary);
  const top25 = useAppSelector(selectTop25Rankings);
  const top12 = useAppSelector(selectTop12Projection);
  const scheduleLength = useAppSelector((state) => state.season.scheduleByWeek.length);
  const gamesSimmed = useAppSelector((state) => state.season.gameResults.length);
  const playoffs = useAppSelector((state) => state.season.playoffs);

  const regularSeasonComplete = scheduleLength > 0 && seasonSummary.completedWeeks >= scheduleLength;
  const playoffStarted = Boolean(playoffs);
  const playoffComplete = Boolean(playoffs?.championTeamId);
  const rankingsGenerated = top25.length === 25 && top12.length === 12;
  const weekDetailsAvailable = gamesSimmed > 0;

  const alphaExitChecklist = [
    {
      item: 'Rankings criteria are documented and explainable in UI.',
      done: true,
      detail: 'Top 25 page includes formula weights and #1 score breakdown.',
      link: '/rankings',
      linkLabel: 'Open Rankings',
    },
    {
      item: 'Playoff flow is deterministic and validated end-to-end.',
      done: playoffComplete,
      detail: playoffComplete
        ? 'A playoff champion has been produced in the current save.'
        : playoffStarted
          ? 'Playoffs have started. Finish remaining rounds to validate full flow.'
          : 'Start and complete playoffs from the season flow to validate the full bracket loop.',
      link: '/playoffs',
      linkLabel: 'Open Playoffs',
    },
    {
      item: 'Week/game detail pages provide enough depth to understand results.',
      done: weekDetailsAvailable,
      detail: weekDetailsAvailable
        ? `Weekly game summaries are available (${gamesSimmed} simulated games this save).`
        : 'Sim at least one week to populate game-level result details.',
      link: '/season',
      linkLabel: 'Open Season',
    },
    {
      item: 'Core loops pass regression tests (schedule, sim, rankings, playoffs).',
      done: false,
      detail: 'Test coverage exists, but alpha requires a consolidated regression command and routine run cadence.',
      link: '/alpha',
      linkLabel: 'Track Here',
    },
    {
      item: 'UI is usable on common desktop + tablet viewports.',
      done: false,
      detail: 'Layout improvements are in progress; continue responsive table and navigation polish.',
      link: '/season/week/0',
      linkLabel: 'Spot-check Week View',
    },
  ] as const;

  const exitCompleted = alphaExitChecklist.filter((entry) => entry.done).length;
  const exitProgressPct = Math.round((exitCompleted / alphaExitChecklist.length) * 100);

  const statusLabel = (status: (typeof alphaChecklist)[number]['status']) => {
    if (status === 'complete') return '✅ Complete';
    if (status === 'in-progress') return '🟡 In Progress';
    return '🎯 Next Up';
  };

  return (
    <div className="flex-col gap-4">
      <section className="card">
        <h2>Alpha Stage Progress</h2>
        <p className="text-sm text-gray-500">
          This view tracks where the project is today versus what we still need before calling the game alpha-ready.
        </p>
        <div style={{ marginTop: '0.75rem' }}>
          <strong>{progressPct}% complete</strong> ({completed}/{alphaChecklist.length} focus areas complete)
        </div>
      </section>

      <section className="card">
        <h3>Feature Checkpoint</h3>
        <table>
          <thead>
            <tr>
              <th>Area</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {alphaChecklist.map((item) => (
              <tr key={item.area}>
                <td>{item.area}</td>
                <td>{statusLabel(item.status)}</td>
                <td>{item.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h3>Alpha Exit Checklist Tracker</h3>
        <p className="text-sm text-gray-500">
          Save-aware checklist status based on current simulation progress and alpha criteria.
        </p>
        <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem' }}>
          <strong>{exitProgressPct}% exit-ready</strong> ({exitCompleted}/{alphaExitChecklist.length} checklist items)
        </div>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.75rem' }}>
          {alphaExitChecklist.map((entry) => (
            <li
              key={entry.item}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '0.6rem',
                padding: '0.75rem',
                background: entry.done ? '#f0fdf4' : '#fff7ed',
              }}
            >
              <div style={{ fontWeight: 600 }}>{entry.done ? '✅' : '🟡'} {entry.item}</div>
              <div className="text-sm text-gray-500" style={{ marginTop: '0.3rem' }}>{entry.detail}</div>
              <div style={{ marginTop: '0.4rem' }}>
                <Link to={entry.link} className="text-sm">
                  {entry.linkLabel}
                </Link>
              </div>
            </li>
          ))}
        </ul>

        <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#64748b' }}>
          Current save snapshot: season started <strong>{seasonHasStarted ? 'yes' : 'no'}</strong>, regular season complete{' '}
          <strong>{regularSeasonComplete ? 'yes' : 'no'}</strong>, rankings generated <strong>{rankingsGenerated ? 'yes' : 'no'}</strong>, playoff
          complete <strong>{playoffComplete ? 'yes' : 'no'}</strong>.
        </div>
      </section>

      <section className="card">
        <h3>Recommended Next Steps</h3>
        <ol style={{ margin: '0.5rem 0 0 1rem' }}>
          <li>Complete playoff round simulation in-save and verify bracket progression + champion persistence.</li>
          <li>Deepen season week/game drill-down so users can inspect outcomes clearly.</li>
          <li>Add a single regression command covering schedule, rankings, and playoff determinism checks.</li>
          <li>Run a UX polish pass for responsive layout and accessibility basics.</li>
        </ol>
        <div style={{ marginTop: '1rem' }}>
          <Link to="/season" className="btn btn-primary">
            Continue Season Work
          </Link>
        </div>
      </section>
    </div>
  );
}

export default AlphaStagePage;
