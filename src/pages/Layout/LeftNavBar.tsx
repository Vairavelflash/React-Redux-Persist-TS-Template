import { NavLink } from 'react-router-dom';

function LeftNavBar() {
  const navClassName = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'navLink navLink-active' : 'navLink';

  return (
    <nav className="leftNav">
      <NavLink to="/" end className={navClassName}>
        Home
      </NavLink>
      <NavLink to="/career" className={navClassName}>
        Coach Career
      </NavLink>
      <div className="separator" style={{ height: '0.5rem' }} />
      <NavLink to="/season" className={navClassName}>
        Season Dashboard
      </NavLink>
      <NavLink to="/season/standings" className={navClassName}>
        Standings
      </NavLink>
      <NavLink to="/playoffs" className={navClassName}>
        Playoffs
      </NavLink>
      <div className="separator" style={{ height: '0.5rem' }} />
      <NavLink to="/rankings" className={navClassName}>
        Rankings
      </NavLink>
      <NavLink to="/conferences" className={navClassName}>
        Conferences
      </NavLink>
      <NavLink to="/exhibition" className={navClassName}>
        Exhibition
      </NavLink>
    </nav>
  );
}

export default LeftNavBar;
