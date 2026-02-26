import { NavLink } from 'react-router-dom';

function LeftNavBar() {
  return (
    <nav className="leftNav">
      <NavLink to="/" end>
        Home
      </NavLink>
      <NavLink to="/career">
        Coach Career
      </NavLink>
      <div className="separator" style={{ height: '0.5rem' }} />
      <NavLink to="/season">
        Season Dashboard
      </NavLink>
      <NavLink to="/season/standings">
        Standings
      </NavLink>
      <NavLink to="/playoffs">
        Playoffs
      </NavLink>
      <div className="separator" style={{ height: '0.5rem' }} />
      <NavLink to="/rankings">
        Rankings
      </NavLink>
      <NavLink to="/conferences">
        Conferences
      </NavLink>
      <NavLink to="/exhibition">
        Exhibition
      </NavLink>
    </nav>
  );
}

export default LeftNavBar;
