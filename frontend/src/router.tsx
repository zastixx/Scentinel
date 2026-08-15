import { createBrowserRouter } from 'react-router-dom';
import Home from './pages/Home';
import RegisterDog from './pages/RegisterDog';
import DogDashboard from './pages/DogDashboard';
import ReportLost from './pages/ReportLost';
import LostAlertPublic from './pages/LostAlertPublic';
import ReportSighting from './pages/ReportSighting';
import MatchResults from './pages/MatchResults';
import ConfirmMatch from './pages/ConfirmMatch';
import MatchProof from './pages/MatchProof';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/register-dog',
    element: <RegisterDog />,
  },
  {
    path: '/dashboard',
    element: <DogDashboard />,
  },
  {
    path: '/report-lost/:dogId',
    element: <ReportLost />,
  },
  {
    path: '/alerts/:id',
    element: <LostAlertPublic />,
  },
  {
    path: '/alerts/dog/:dogId',
    element: <LostAlertPublic />,
  },
  {
    path: '/report-sighting',
    element: <ReportSighting />,
  },
  {
    path: '/match-results',
    element: <MatchResults />,
  },
  {
    path: '/confirm-match/:matchId',
    element: <ConfirmMatch />,
  },
  {
    path: '/matches/:matchId/proof',
    element: <MatchProof />,
  },
]);

export default router;
