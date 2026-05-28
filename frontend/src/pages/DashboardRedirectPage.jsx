import { Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../hooks/useAuth';

const DashboardRedirectPage = () => {
  const { user } = useAuth();

  if (user?.role === 'ADMIN') {
    return <Navigate to={ROUTES.ADMIN} replace />;
  }

  if (user?.role === 'PROPRIETAIRE') {
    return <Navigate to={ROUTES.MY_HOUSES} replace />;
  }

  return <Navigate to={ROUTES.MY_BOOKINGS} replace />;
};

export default DashboardRedirectPage;
