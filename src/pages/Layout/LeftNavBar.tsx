import { NavLink } from 'react-router-dom';

function LeftNavBar() {
  return (
    <nav className="leftNav" aria-label="Main navigation">
      <NavLink to="/" end className={({ isActive }) => (isActive ? 'navLink navLinkActive' : 'navLink')}>
        Home
      </NavLink>
      <NavLink to="/conferences" className={({ isActive }) => (isActive ? 'navLink navLinkActive' : 'navLink')}>
        Conferences
      </NavLink>
      <NavLink to="/rankings" className={({ isActive }) => (isActive ? 'navLink navLinkActive' : 'navLink')}>
        Rankings
      </NavLink>
      <NavLink to="/exhibition" className={({ isActive }) => (isActive ? 'navLink navLinkActive' : 'navLink')}>
        Exhibition
      </NavLink>
      <NavLink to="/season" className={({ isActive }) => (isActive ? 'navLink navLinkActive' : 'navLink')}>
        Season
      </NavLink>
      <NavLink to="/season/standings" className={({ isActive }) => (isActive ? 'navLink navLinkActive' : 'navLink')}>
        Standings
      </NavLink>
      <NavLink to="/playoffs" className={({ isActive }) => (isActive ? 'navLink navLinkActive' : 'navLink')}>
        Playoffs
      </NavLink>
    </nav>
  );
}

export default LeftNavBar;
