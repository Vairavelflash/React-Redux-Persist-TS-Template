function Header() {
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((state) => state.ui.darkMode);

  return (
    <header className="header">
      <h1>College Lacrosse Head Coach Sim</h1>
    </header>
  );
}

export default Header;
