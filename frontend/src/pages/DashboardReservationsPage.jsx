import DashboardOwnerPage from './DashboardOwnerPage';
import MyBookingsPage from './MyBookingsPage';
import { useAuth } from '../hooks/useAuth';

const DashboardReservationsPage = () => {
  const { user } = useAuth();

  if (user?.role === 'PROPRIETAIRE') {
    return <DashboardOwnerPage />;
  }

  return <MyBookingsPage />;
};

export default DashboardReservationsPage;
