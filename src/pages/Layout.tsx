import Footer from './Layout/Footer';
import Header from './Layout/Header';
import LeftNavBar from './Layout/LeftNavBar';
import RightNavBar from './Layout/RightNavBar';
import { Outlet } from 'react-router-dom';
import './style.css';
import { useAppSelector } from '../store/hooks';
import { useEffect } from 'react';

function Layout() {
  const darkMode = useAppSelector((state) => state.ui.darkMode);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <main className="layout">
      <Header />
      <div className="layoutBody">
        <LeftNavBar />
        <div className="childBody">
          <Outlet />
          <Footer />
        </div>
        <RightNavBar />
      </div>
    </main>
  );
}

export default Layout;
