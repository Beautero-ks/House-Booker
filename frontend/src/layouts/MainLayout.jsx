import { Outlet, matchPath, useLocation } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import Navbar from '../components/layout/Navbar';
import { ROUTES } from '../constants/routes';

const MainLayout = () => {
  const location = useLocation();
  const hideFooter =
    location.pathname === ROUTES.SEARCH ||
    Boolean(matchPath(ROUTES.HOUSE_DETAIL, location.pathname)) ||
    location.pathname === ROUTES.LOGIN ||
    location.pathname === ROUTES.REGISTER ||
    location.pathname === ROUTES.PROFILE ||
    location.pathname === ROUTES.ADMIN ||
    location.pathname.startsWith(`${ROUTES.ADMIN}/`) ||
    location.pathname === ROUTES.DASHBOARD ||
    location.pathname.startsWith(`${ROUTES.DASHBOARD}/`);
  return (
    <div className="min-h-screen flex flex-col app-background">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
