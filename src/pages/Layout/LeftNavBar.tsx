import { NavLink } from 'react-router-dom';

type LeftNavBarProps = {
  isMenuOpen: boolean;
  onNavigate?: () => void;
};

type NavItem = {
  to: string;
  label: string;
  end?: boolean;
};

const navSections: Array<{ title: string; items: NavItem[] }> = [
  {
    title: 'Program',
    items: [
      { to: '/', label: 'Home', end: true },
      { to: '/career', label: 'Coach Career' },
      { to: '/career/setup', label: 'Career Setup' },
    ],
  },
  {
    title: 'Season',
    items: [
      { to: '/season', label: 'Season Dashboard' },
      { to: '/season/standings', label: 'Standings' },
      { to: '/playoffs', label: 'Playoffs' },
      { to: '/rankings', label: 'Rankings' },
    ],
  },
  {
    title: 'League',
    items: [
      { to: '/conferences', label: 'Conferences' },
      { to: '/exhibition', label: 'Exhibition' },
      { to: '/alpha', label: 'Alpha Progress' },
    ],
  },
];

function LeftNavBar({ isMenuOpen, onNavigate }: LeftNavBarProps) {
  const navClassName = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'navLink navLink-active' : 'navLink';

  return (
    <nav className={`leftNav ${isMenuOpen ? 'leftNav-open' : ''}`} aria-label="Primary">
      {navSections.map((section) => (
        <div key={section.title} className="navSection">
          <p className="navSectionTitle">{section.title}</p>
          {section.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={navClassName}
              onClick={onNavigate}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}

export default LeftNavBar;
