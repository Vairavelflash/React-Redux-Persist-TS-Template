import { Link } from 'react-router-dom';

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
        <h3>Recommended Next Steps</h3>
        <ol style={{ margin: '0.5rem 0 0 1rem' }}>
          <li>Continue balancing ranking and playoff scoring heuristics using season-level regression checks.</li>
          <li>Deepen season week/game drill-down so users can inspect outcomes clearly.</li>
          <li>Add alpha regression checks around season progression, rankings, and playoffs.</li>
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
