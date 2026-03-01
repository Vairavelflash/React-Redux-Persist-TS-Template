import { Link } from 'react-router-dom';

function RightNavBar() {
  return (
    <aside className="rightNav">
      <div className="rightNavSection">
        <h3 className="m-0">Build Status</h3>
        <ul className="m-0 p-0 rightNavList">
          <li>128-team league loaded</li>
          <li>Deterministic roster generation</li>
          <li>Season + coach persistence wired</li>
        </ul>
      </div>
      <div className="rightNavSection">
        <h3 className="m-0">Quick Links</h3>
        <div className="flex flex-col gap-2 mt-2">
          <Link to="/season" className="btn">
            Continue Season
          </Link>
          <Link to="/rankings" className="btn">
            View Top 25
          </Link>
          <Link to="/playoffs" className="btn">
            View Bracket
          </Link>
        </div>
      </div>
    </aside>
  );
}

export default RightNavBar;
