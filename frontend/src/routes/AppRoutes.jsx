import { Route, Routes } from 'react-router-dom';
import PlaceholderPage from '../components/common/PlaceholderPage';
import { ROUTES } from '../constants/routes';
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';
import BookingPage from '../pages/BookingPage';
import CreateHousePage from '../pages/CreateHousePage';
import DashboardAdminPage from '../pages/DashboardAdminPage';
import DashboardRedirectPage from '../pages/DashboardRedirectPage';
import DashboardOwnerPage from '../pages/DashboardOwnerPage';
import DashboardReservationsPage from '../pages/DashboardReservationsPage';
import HomePage from '../pages/HomePage';
import HouseDetailPage from '../pages/HouseDetailPage';
import LoginPage from '../pages/LoginPage';
import MessagingPage from '../pages/MessagingPage';
import OtpPage from '../pages/OtpPage';
import ProfilePage from '../pages/profile/ProfilePage';
import RegisterPage from '../pages/RegisterPage';
import ReviewPage from '../pages/ReviewPage';
import SearchPage from '../pages/SearchPage';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path={ROUTES.SEARCH} element={<SearchPage />} />
        <Route path={ROUTES.HOUSE_DETAIL} element={<HouseDetailPage />} />
        <Route path={ROUTES.REVIEWS} element={<ReviewPage />} />
        <Route path={ROUTES.ABOUT} element={<PlaceholderPage titleKey="footer_about" />} />
        <Route path={ROUTES.CONTACT} element={<PlaceholderPage titleKey="nav_contact" />} />
        <Route path={ROUTES.TERMS} element={<PlaceholderPage titleKey="footer_terms" />} />
        <Route path={ROUTES.PRIVACY} element={<PlaceholderPage titleKey="footer_privacy" />} />

        <Route element={<AuthLayout />}>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
          <Route path={ROUTES.OTP} element={<OtpPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.BOOKING} element={<BookingPage />} />
          <Route path={ROUTES.MESSAGES} element={<MessagingPage />} />
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
          <Route path={ROUTES.DASHBOARD} element={<DashboardRedirectPage />} />
          <Route path={ROUTES.MY_BOOKINGS} element={<DashboardReservationsPage />} />
        </Route>

        <Route element={<ProtectedRoute roles={['PROPRIETAIRE']} />}>
          <Route path={ROUTES.MY_HOUSES} element={<DashboardOwnerPage />} />
          <Route path={ROUTES.ADD_HOUSE} element={<CreateHousePage />} />
        </Route>

        <Route element={<ProtectedRoute roles={['ADMIN']} />}>
          <Route path={ROUTES.ADMIN} element={<DashboardAdminPage />} />
          <Route path={ROUTES.ADMIN_USERS} element={<DashboardAdminPage section="users" />} />
          <Route path={ROUTES.ADMIN_HOUSES} element={<DashboardAdminPage section="houses" />} />
          <Route path={ROUTES.ADMIN_BOOKINGS} element={<DashboardAdminPage section="bookings" />} />
        </Route>

        <Route path="*" element={<PlaceholderPage title="Page 404" />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
