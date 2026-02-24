import { toggleDarkMode } from '../../features/ui/uiSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

function Header() {
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((state) => state.ui.darkMode);

  return (
    <header className="header">
      <div className="headerRow">
        <div>
          <h1>College Lacrosse Head Coach Sim</h1>
          <p className="subHeader">Deterministic 128-team sandbox · fictional programs · season to championship</p>
        </div>
        <button type="button" onClick={() => dispatch(toggleDarkMode())} className="themeToggleBtn">
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>
    </header>
  );
}

export default Header;
