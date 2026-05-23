import { Route, Routes } from 'react-router-dom';
import PlaceholderPage from '../components/common/PlaceholderPage';
import { ROUTES } from '../constants/routes';
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';
import BookingPage from '../pages/BookingPage';
import DashboardAdminPage from '../pages/DashboardAdminPage';
import DashboardOwnerPage from '../pages/DashboardOwnerPage';
import HomePage from '../pages/HomePage';
import HouseDetailPage from '../pages/HouseDetailPage';
import LoginPage from '../pages/LoginPage';
import MessagingPage from '../pages/MessagingPage';
import OtpPage from '../pages/OtpPage';
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
          <Route path={ROUTES.DASHBOARD} element={<DashboardOwnerPage />} />
          <Route path={ROUTES.ADMIN} element={<DashboardAdminPage />} />
          <Route path={ROUTES.MESSAGES} element={<MessagingPage />} />
          <Route path={ROUTES.PROFILE} element={<PlaceholderPage titleKey="nav_profile" />} />
        </Route>

        <Route path="*" element={<PlaceholderPage title="Page 404" />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
