import { Link } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';

function RightNavBar() {
  const season = useAppSelector((state) => state.season);
  const seasonStarted = season.phase !== 'PRE';

  return (
    <aside className="rightNav dynastyRightRail">
      <div className="rightNavSection dynastyPanel">
        <h3 className="m-0">Command Center</h3>
        <p className="m-0 dynastyPanelMuted">
          {seasonStarted
            ? `Regular season in progress · Week ${season.currentWeekIndex + 1}`
            : 'Launch your dynasty from preseason.'}
        </p>
      </div>
      <div className="rightNavSection dynastyPanel">
        <h3 className="m-0">Quick Actions</h3>
        <div className="flex flex-col gap-2 mt-2">
          <Link to="/season" className="btn dynastyRailBtn">
            Open Season Hub
          </Link>
          <Link to="/career" className="btn dynastyRailBtn">
            Coach Office
          </Link>
          <Link to="/rankings" className="btn dynastyRailBtn">
            National Polls
          </Link>
        </div>
      </div>
      <div className="rightNavSection dynastyPanel">
        <h3 className="m-0">Build Status</h3>
        <ul className="m-0 p-0 rightNavList">
          <li>Menu system refreshed for dynasty flow</li>
          <li>Coach + season context surfaced globally</li>
          <li>Core sim pages grouped by role</li>
        </ul>
      </div>
    </aside>
  );
}

export default RightNavBar;
