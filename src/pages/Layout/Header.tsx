import { Link } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';

function Header() {
  const onboardingStep = useAppSelector((state) => state.coach.onboardingStep);
  const selectedTeamId = useAppSelector((state) => state.coach.selectedTeamId);
  const teams = useAppSelector((state) => state.league.teams);
  const season = useAppSelector((state) => state.season);

  const selectedTeam = teams.find((team) => team.id === selectedTeamId) ?? null;
  const seasonStarted = season.phase !== 'PRE';
  const continuePath = onboardingStep === 'READY' ? '/career' : '/career/setup';
  const continueLabel = onboardingStep === 'READY' ? 'Continue' : 'Start Career';

  return (
    <header className="header dynastyHeader">
      <div>
        <p className="dynastyEyebrow">College Dynasty Mode</p>
        <h1 className="dynastyTitle">College Lacrosse Head Coach Sim</h1>
      </div>
      <div className="dynastyHeaderMeta">
        <div className="dynastyMetaCard">
          <span className="dynastyMetaLabel">Program</span>
          <strong>{selectedTeam ? `${selectedTeam.schoolName} ${selectedTeam.nickname}` : 'Unassigned'}</strong>
        </div>
        <div className="dynastyMetaCard">
          <span className="dynastyMetaLabel">Season</span>
          <strong>{season.year}</strong>
          <small>{seasonStarted ? `Week ${season.currentWeekIndex + 1}` : 'Preseason'}</small>
        </div>
        <Link to={continuePath} className="btn btn-primary dynastyActionBtn">
          {continueLabel}
        </Link>
      </div>
    </header>
  );
}

export default Header;
