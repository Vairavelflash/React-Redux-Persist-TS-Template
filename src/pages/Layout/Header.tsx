import { toggleDarkMode } from '../../features/ui/uiSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

function Header() {
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((state) => state.ui.darkMode);

  return (
    <header className="header">
      <div className="headerRow">
        <div>
          <p className="kickerText">College Lacrosse Dynasty Mode</p>
          <h1>Head Coach Command Center</h1>
          <p className="subHeader">Deterministic 128-team universe · recruit your legacy · chase the title</p>
        </div>
        <div className="headerActions">
          <span className="statusChip">FRANCHISE HUB</span>
          <button type="button" onClick={() => dispatch(toggleDarkMode())} className="themeToggleBtn">
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
