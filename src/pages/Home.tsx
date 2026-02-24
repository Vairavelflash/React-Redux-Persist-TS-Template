import { Link } from 'react-router-dom';

function Home() {
  return (
    <section>
      <div className="card heroPanel">
        <p className="kickerText">Dynasty Central</p>
        <h2>Build Your Program. Control Every Week.</h2>
        <p className="mutedText">Run recruiting, simulate your season, monitor rankings, and push through a 12-team playoff in one unified command center.</p>
        <div className="quickLinks commandLinks">
          <Link to="/career/setup">Create Coach</Link>
          <Link to="/season">Open Season Hub</Link>
          <Link to="/rankings">View Rankings</Link>
          <Link to="/playoffs">Playoff Bracket</Link>
        </div>
      </div>

      <div className="careerStatsGrid">
        <div className="statTile">
          <span className="mutedText">League Scale</span>
          <strong>128 Teams</strong>
        </div>
        <div className="statTile">
          <span className="mutedText">Regular Season</span>
          <strong>12 Weeks</strong>
        </div>
        <div className="statTile">
          <span className="mutedText">Selection Lens</span>
          <strong>Top 25 + Top 12</strong>
        </div>
        <div className="statTile">
          <span className="mutedText">Postseason</span>
          <strong>12-Team Playoff</strong>
        </div>
      </div>
    </section>
  );
}

export default Home;
