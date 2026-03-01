import { NavLink } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';

type LeftNavBarProps = {
  isMenuOpen: boolean;
  onNavigate?: () => void;
};

type NavItem = {
  to: string;
  label: string;
  hint: string;
  end?: boolean;
};

const navSections: Array<{ title: string; items: NavItem[] }> = [
  {
    title: 'Coach Central',
    items: [
      { to: '/', label: 'Overview', hint: 'Program home', end: true },
      { to: '/career', label: 'Coach Office', hint: 'Career dashboard' },
      { to: '/career/setup', label: 'Staff Setup', hint: 'Profile and team' },
    ],
  },
  {
    title: 'Season Hub',
    items: [
      { to: '/season', label: 'Season Dashboard', hint: 'Schedule + controls' },
      { to: '/season/standings', label: 'Standings', hint: 'Conference race' },
      { to: '/rankings', label: 'Polls & Projection', hint: 'Top 25 + CFP' },
      { to: '/playoffs', label: 'Playoff Bracket', hint: 'Championship path' },
    ],
  },
  {
    title: 'Scouting & League',
    items: [
      { to: '/conferences', label: 'Conference Browser', hint: 'All 128 teams' },
      { to: '/exhibition', label: 'Exhibition Lab', hint: 'Single game sandbox' },
      { to: '/alpha', label: 'Roadmap', hint: 'Current build status' },
    ],
  },
];

function LeftNavBar({ isMenuOpen, onNavigate }: LeftNavBarProps) {
  const navClassName = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'navLink navLink-active' : 'navLink';

  const coachProfile = useAppSelector((state) => state.coach.profile);
  const selectedTeamId = useAppSelector((state) => state.coach.selectedTeamId);
  const teams = useAppSelector((state) => state.league.teams);
  const selectedTeam = teams.find((team) => team.id === selectedTeamId) ?? null;

  return (
    <nav className={`leftNav dynastySideNav ${isMenuOpen ? 'leftNav-open' : ''}`} aria-label="Primary">
      <div className="dynastyCoachCard">
        <p className="dynastyCoachLabel">Head Coach</p>
        <h3>{coachProfile?.name ?? 'Create your coach'}</h3>
        <p>{selectedTeam ? `${selectedTeam.schoolName} ${selectedTeam.nickname}` : 'No program selected'}</p>
      </div>

      {navSections.map((section) => (
        <div key={section.title} className="navSection dynastyNavSection">
          <p className="navSectionTitle">{section.title}</p>
          {section.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={navClassName}
              onClick={onNavigate}
            >
              <span className="navLinkTitle">{item.label}</span>
              <small className="navLinkHint">{item.hint}</small>
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}

export default LeftNavBar;
