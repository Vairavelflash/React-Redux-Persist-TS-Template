import { NavLink } from 'react-router-dom';

function LeftNavBar() {
  return (
    <nav className="leftNav">
      <NavLink to="/" end>
        Home
      </NavLink>
      <NavLink to="/conferences">Conferences</NavLink>
      <NavLink to="/rankings">Rankings</NavLink>
      <NavLink to="/exhibition">Exhibition</NavLink>
      <NavLink to="/season">Season</NavLink>
      <NavLink to="/season/standings">Standings</NavLink>
      <NavLink to="/playoffs">Playoffs</NavLink>
    </nav>
  );
}

export default LeftNavBar;
