import { Link } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';

function RightNavBar() {
  const season = useAppSelector((state) => state.season);
  const onboardingStep = useAppSelector((state) => state.coach.onboardingStep);
  const seasonStarted = season.phase !== 'PRE';
  const careerReady = onboardingStep === 'READY';

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
          <Link to={careerReady ? '/season' : '/career/setup'} className="btn dynastyRailBtn">
            {careerReady ? 'Open Season Hub' : 'Finish Career Setup'}
          </Link>
          <Link to={careerReady ? '/career' : '/career/setup'} className="btn dynastyRailBtn">
            {careerReady ? 'Coach Office' : 'Create Coach Profile'}
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
          <li>{careerReady ? 'Career mode unlocked and ready to advance.' : 'Career setup required before advancing weeks.'}</li>
        </ul>
      </div>
    </aside>
  );
}

export default RightNavBar;
