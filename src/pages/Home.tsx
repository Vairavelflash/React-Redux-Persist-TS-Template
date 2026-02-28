import { Link } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

function Home() {
  const season = useAppSelector(state => state.season);
  const { year, phase, currentWeekIndex, seasonSeed } = season;

  const getStatusText = () => {
    if (phase === 'PRE') return 'Pre-Season';
    if (phase === 'REGULAR') return `Week ${currentWeekIndex + 1}`;
    if (phase === 'PLAYOFF') return 'Playoffs';
    if (phase === 'OFFSEASON') return 'Offseason';
    return phase;
  };

  const getNextAction = () => {
      if (phase === 'PRE') return { label: 'Start New Season', link: '/season', primary: true };
      if (phase === 'REGULAR') return { label: `Go to Week ${currentWeekIndex + 1}`, link: '/season', primary: true };
      if (phase === 'PLAYOFF') return { label: 'Go to Playoffs', link: '/playoffs', primary: true };
      if (phase === 'OFFSEASON') return { label: 'Review Season', link: '/season', primary: false };
      return { label: 'View Season', link: '/season', primary: false };
  }

  const action = getNextAction();

  return (
    <div>
        <section className="card">
            <h2>Dashboard</h2>
            <div className="stat-row">
                <div className="stat-item">
                    <label>Year</label>
                    <span className="value">{year}</span>
                </div>
                <div className="stat-item">
                    <label>Status</label>
                    <span className="value">{getStatusText()}</span>
                </div>
                <div className="stat-item">
                    <label>Seed</label>
                    <span className="value" style={{fontSize: '1rem'}}>{seasonSeed || '-'}</span>
                </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
                <Link to={action.link} className={`btn ${action.primary ? 'btn-primary' : ''}`}>
                    {action.label}
                </Link>
            </div>
        </section>

        <section className="card">
            <h3>Quick Actions</h3>
            <div className="link-grid">
                <Link to="/career" className="link-card">
                    <strong>Coach Career</strong>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>Manage recruiting & status</div>
                </Link>
                <Link to="/conferences" className="link-card">
                    <strong>Conferences</strong>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>Browse all teams by conference</div>
                </Link>
                <Link to="/season/standings" className="link-card">
                    <strong>League Standings</strong>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>Conference and overall records</div>
                </Link>
                <Link to="/alpha" className="link-card">
                    <strong>Alpha Progress</strong>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>Feature checklist + next priorities</div>
                </Link>
            </div>
        </section>
    </div>
  );
}

export default Home;
