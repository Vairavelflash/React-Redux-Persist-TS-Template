import Footer from './Layout/Footer';
import Header from './Layout/Header';
import LeftNavBar from './Layout/LeftNavBar';
import RightNavBar from './Layout/RightNavBar';
import { Outlet } from 'react-router-dom';
import { useSeasonSanityCheck } from '../hooks/useSeasonSanityCheck';
import './style.css';

function Layout() {
  const { isValid, error } = useSeasonSanityCheck();

  return (
    <main className="layout">
      <Header />
      {!isValid && (
        <div style={{
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          padding: '1rem',
          textAlign: 'center',
          borderBottom: '1px solid #fca5a5',
          fontWeight: 'bold',
          zIndex: 9999
        }}>
          ⚠️ Application State Warning: {error}
        </div>
      )}
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
