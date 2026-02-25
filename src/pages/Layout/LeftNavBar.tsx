import { NavLink } from 'react-router-dom';

function LeftNavBar() {
  return (
    <nav className="leftNav">
      <NavLink to="/" end>
        Home
      </NavLink>
      <NavLink to="/season">Season Dashboard</NavLink>
      <NavLink to="/season/standings">Standings</NavLink>
      <NavLink to="/playoffs">Playoffs</NavLink>
      <NavLink to="/career">Career</NavLink>
      <div className="separator" style={{ height: '1rem' }} />
      <NavLink to="/conferences">Conferences</NavLink>
      <NavLink to="/rankings">Rankings</NavLink>
      <NavLink to="/exhibition">Exhibition</NavLink>
    </nav>
  );
}

export default LeftNavBar;
