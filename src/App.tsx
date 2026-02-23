import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Layout from './pages/Layout';
import Home from './pages/Home';
import ConferencesPage from './pages/ConferencesPage';
import TeamPage from './pages/TeamPage';
import RankingsPage from './pages/RankingsPage';
import ExhibitionPage from './pages/ExhibitionPage';
import SeasonPage from './pages/SeasonPage';
import SeasonWeekPage from './pages/SeasonWeekPage';
import SeasonStandingsPage from './pages/SeasonStandingsPage';
import './App.css';

function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Layout />,
      children: [
        { index: true, element: <Home /> },
        { path: 'conferences', element: <ConferencesPage /> },
        { path: 'team/:id', element: <TeamPage /> },
        { path: 'rankings', element: <RankingsPage /> },
        { path: 'exhibition', element: <ExhibitionPage /> },
        { path: 'season', element: <SeasonPage /> },
        { path: 'season/week/:weekIndex', element: <SeasonWeekPage /> },
        { path: 'season/standings', element: <SeasonStandingsPage /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
