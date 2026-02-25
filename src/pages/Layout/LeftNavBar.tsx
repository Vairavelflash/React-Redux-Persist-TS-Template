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
    </nav>
  );
}

export default LeftNavBar;
