import { Link } from 'react-router-dom';

function RightNavBar() {
  return (
    <aside className="rightNav">
      <h3>League Snapshot</h3>
      <ul className="plainList compactList">
        <li>128 teams · 16 conferences</li>
        <li>12-game regular season</li>
        <li>Top 25 + Top 12 projection</li>
        <li>12-team playoff bracket</li>
      </ul>

      <h4>Quick Actions</h4>
      <div className="quickLinks">
        <Link to="/season">Go to Season</Link>
        <Link to="/rankings">View Rankings</Link>
        <Link to="/playoffs">Open Playoffs</Link>
        <Link to="/career/setup">Career Setup</Link>
        <Link to="/career">Coach Career</Link>
      </div>

      <p className="subHeader">Tip: Sim a full season, then open Playoffs to run rounds to a champion.</p>
    </aside>
  );
}

export default RightNavBar;
