import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { ROUTES } from '../../constants/routes';
import { Home, Menu, X, User, LogOut, Globe, ChevronDown } from 'lucide-react';
import Button from '../ui/Button';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { t, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const profileToggleRef = useRef(null);

  const handleLogout = useCallback(() => {
    logout();
    navigate(ROUTES.HOME);
  }, [logout, navigate]);

  useEffect(() => {
    if (!isProfileMenuOpen) {
      return undefined;
    }

    const handleOutsideClick = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target) &&
        profileToggleRef.current &&
        !profileToggleRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isProfileMenuOpen]);

  const avatarLetter = user?.name?.charAt(0).toUpperCase() || 'U';
  const avatarUrl = user?.photoUrl;
  const userDisplay = user?.name?.split(' ')[0] || t('nav_profile');
  const isOwner = user?.role === 'PROPRIETAIRE';
  const isAdmin = user?.role === 'ADMIN';
  const isAdminPage = location.pathname === ROUTES.ADMIN || location.pathname.startsWith(`${ROUTES.ADMIN}/`);
  const dashboardRoute = isAdmin ? ROUTES.ADMIN : isOwner ? ROUTES.MY_HOUSES : ROUTES.MY_BOOKINGS;
  const dashboardLabel = isAdmin ? t('admin_title') : isOwner ? t('dashboard_owner_listings') : t('my_bookings_title');

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-40 border-b border-[var(--color-border)]">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Link to={ROUTES.HOME} className="flex min-h-11 min-w-0 items-center gap-2 pl-0">
              <Home className="shrink-0 text-primary" size={26} />
              <span className="truncate text-lg font-bold tracking-tight text-gray-900 sm:text-xl">HouseBooker</span>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 items-center justify-end gap-5">
            {!isAdminPage && (
              <>
                <Link to={ROUTES.HOME} className="text-sm text-gray-600 hover:text-primary font-medium">{t('nav_home')}</Link>
                <Link to={ROUTES.SEARCH} className="text-sm text-gray-600 hover:text-primary font-medium">{t('nav_listings')}</Link>
              </>
            )}
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary font-medium"
            >
              <Globe size={16} />
              <span>{t('nav_switch_language')}</span>
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link to={dashboardRoute} className="text-sm text-gray-600 hover:text-primary font-medium">
                  {dashboardLabel}
                </Link>

                <div className="relative" ref={profileMenuRef}>
                  <button
                    type="button"
                    ref={profileToggleRef}
                    onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-gray-200 bg-white px-2 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary text-white text-sm font-semibold">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={userDisplay} className="h-full w-full object-cover" />
                      ) : (
                        avatarLetter
                      )}
                    </div>
                    <span className="hidden sm:inline">{userDisplay}</span>
                    <ChevronDown size={16} className={`transition-transform ${isProfileMenuOpen ? 'rotate-180' : 'rotate-0'}`} />
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 top-full z-50 mt-2 min-w-[200px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg ring-1 ring-black/5">
                      <Link
                        to={ROUTES.PROFILE}
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex min-h-11 items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User size={16} /> {t('nav_profile')}
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex min-h-11 w-full items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-gray-50"
                      >
                        <LogOut size={16} /> {t('nav_logout')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to={ROUTES.LOGIN} className="text-sm text-gray-600 hover:text-primary font-medium">
                  {t('nav_login')}
                </Link>
                <Link to={ROUTES.REGISTER}>
                  <Button variant="primary">{t('nav_register')}</Button>
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button type="button" onClick={toggleLanguage} className="min-h-11 rounded-md px-2 text-sm font-medium text-gray-600">
              <Globe size={18} />
              <span className="sr-only">{t('nav_switch_language')}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-gray-500 hover:bg-gray-50 hover:text-gray-700 focus:outline-none"
              aria-label={isMobileMenuOpen ? t('common_close_menu') : t('common_open_menu')}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-[var(--color-border)] animate-fade-in">
          <div className="space-y-1 px-4 pb-4 pt-3">
            {!isAdminPage && (
              <>
                <Link
                  to={ROUTES.HOME}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block min-h-11 rounded-md px-3 py-2.5 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary"
                >
                  {t('nav_home')}
                </Link>
                <Link
                  to={ROUTES.SEARCH}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block min-h-11 rounded-md px-3 py-2.5 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary"
                >
                  {t('nav_listings')}
                </Link>
              </>
            )}
            {isAuthenticated ? (
              <>
                <Link
                  to={dashboardRoute}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block min-h-11 rounded-md px-3 py-2.5 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary"
                >
                  {dashboardLabel}
                </Link>
                <Link
                  to={ROUTES.PROFILE}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block min-h-11 rounded-md px-3 py-2.5 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary"
                >
                  {t('nav_profile')}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="block min-h-11 w-full rounded-md px-3 py-2.5 text-left text-base font-medium text-red-600 hover:bg-gray-50"
                >
                  {t('nav_logout')}
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 p-3 border-t mt-2">
                <Link to={ROUTES.LOGIN} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" fullWidth>{t('nav_login')}</Button>
                </Link>
                <Link to={ROUTES.REGISTER} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="primary" fullWidth>{t('nav_register')}</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
