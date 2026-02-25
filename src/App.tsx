import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Layout from './pages/Layout';
import Home from './pages/Home';
import ConferencesPage from './pages/ConferencesPage';
import TeamPage from './pages/TeamPage';
import RankingsPage from './pages/RankingsPage';
import ExhibitionPage from './pages/ExhibitionPage';
import CoachCareerSetupPage from './pages/CoachCareerSetupPage';
import CoachCareerPage from './pages/CoachCareerPage';
import SeasonPage from './pages/SeasonPage';
import SeasonStandingsPage from './pages/SeasonStandingsPage';
import SeasonWeekPage from './pages/SeasonWeekPage';
import PlayoffsPage from './pages/PlayoffsPage';
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
        { path: 'career', element: <CoachCareerPage /> },
        { path: 'career/setup', element: <CoachCareerSetupPage /> },
        { path: 'season', element: <SeasonPage /> },
        { path: 'season/standings', element: <SeasonStandingsPage /> },
        { path: 'season/week/:weekIndex', element: <SeasonWeekPage /> },
        { path: 'playoffs', element: <PlayoffsPage /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
