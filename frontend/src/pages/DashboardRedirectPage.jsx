import { Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../hooks/useAuth';
import DashboardOwnerPage from './DashboardOwnerPage';

const DashboardRedirectPage = () => {
  const { user } = useAuth();

  if (user?.role === 'ADMIN') {
    return <Navigate to={ROUTES.ADMIN} replace />;
  }

  if (user?.role === 'PROPRIETAIRE') {
    return <DashboardOwnerPage />;
  }

  return <Navigate to={ROUTES.MY_BOOKINGS} replace />;
};

export default DashboardRedirectPage;
