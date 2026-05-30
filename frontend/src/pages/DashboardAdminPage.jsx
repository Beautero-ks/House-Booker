import { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { formatPrice } from '../utils/formatters';
import { Users, Home, Calendar, DollarSign, Activity, ImageOff, Ban, RotateCcw, Trash2 } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import Loader from '../components/ui/Loader';
import Button from '../components/ui/Button';
import PaginationControls, { PAGE_SIZE } from '../components/common/PaginationControls';
import { assignRole, blockUser, deleteUserByAdmin, getUsers, unblockUser } from '../services/adminApi';
import { deleteHouse, getHouses } from '../services/houseApi';
import { getAllBookings } from '../services/bookingApi';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/routes';

const STAT_COLORS = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  purple: 'bg-purple-50 text-purple-600',
  orange: 'bg-orange-50 text-orange-600',
};
const HIDDEN_BOOKING_STATUSES = new Set(['CANCELLED', 'CANCELED', 'cancelled', 'canceled', 'annulée']);

const ADMIN_NAV_ITEMS = [
  { to: ROUTES.ADMIN, labelKey: 'admin_dashboard_nav', icon: Activity, section: 'overview' },
  { to: ROUTES.ADMIN_USERS, labelKey: 'admin_users', icon: Users, section: 'users' },
  { to: ROUTES.ADMIN_HOUSES, labelKey: 'admin_listings', icon: Home, section: 'houses' },
  { to: ROUTES.ADMIN_BOOKINGS, labelKey: 'admin_bookings', icon: Calendar, section: 'bookings' },
];

const UserAvatar = ({ user }) => {
  const initial = user?.name?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-primary text-sm font-semibold text-white">
      {user?.photoUrl ? (
        <img src={user.photoUrl} alt={user.name || user.email} className="h-full w-full object-cover" />
      ) : (
        initial
      )}
    </div>
  );
};

const DashboardAdminPage = ({ section = 'overview' }) => {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const [usersResponse, setUsersResponse] = useState({ users: [], total: 0 });
  const [houses, setHouses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  const [usersPage, setUsersPage] = useState(1);
  const [housesPage, setHousesPage] = useState(1);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      setLoading(true);
      try {
        const [users, logements, reservations] = await Promise.all([
          getUsers({ page: 0, size: 100 }),
          getHouses(),
          getAllBookings({ page: 0, size: 100 }),
        ]);
        if (mounted) {
          setUsersResponse(users);
          setHouses(logements);
          setBookings(reservations.filter((booking) => !HIDDEN_BOOKING_STATUSES.has(booking.status)));
        }
      } catch {
        if (mounted) {
          setUsersResponse({ users: [], total: 0 });
          setHouses([]);
          setBookings([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadDashboard();
    return () => {
      mounted = false;
    };
  }, []);

  const chartData = useMemo(() => {
    const valid = houses.filter((house) => house.statutValidation === 'VALIDE').length;
    const pending = houses.filter((house) => house.statutValidation === 'EN_ATTENTE').length;
    const rejected = houses.filter((house) => house.statutValidation === 'REJETE').length;
    return [
      { name: t('admin_chart_validated'), bookings: valid },
      { name: t('admin_chart_pending'), bookings: pending },
      { name: t('admin_chart_rejected'), bookings: rejected },
    ];
  }, [houses, t]);

  const visibleBookings = bookings.filter((booking) => !HIDDEN_BOOKING_STATUSES.has(booking.status));
  const totalRevenue = visibleBookings.reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0);
  const users = usersResponse.users;
  const owners = users.filter((user) => user.role === 'PROPRIETAIRE');
  const clients = users.filter((user) => user.role === 'USER');
  const filteredUsers = userRoleFilter === 'ALL'
    ? users
    : users.filter((user) => user.role === userRoleFilter);
  const usersTotalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const housesTotalPages = Math.max(1, Math.ceil(houses.length / PAGE_SIZE));
  const bookingsTotalPages = Math.max(1, Math.ceil(visibleBookings.length / PAGE_SIZE));
  const currentUsersPage = Math.min(usersPage, usersTotalPages);
  const currentHousesPage = Math.min(housesPage, housesTotalPages);
  const currentBookingsPage = Math.min(bookingsPage, bookingsTotalPages);
  const paginatedUsers = filteredUsers.slice((currentUsersPage - 1) * PAGE_SIZE, currentUsersPage * PAGE_SIZE);
  const paginatedHouses = houses.slice((currentHousesPage - 1) * PAGE_SIZE, currentHousesPage * PAGE_SIZE);
  const paginatedBookings = visibleBookings.slice((currentBookingsPage - 1) * PAGE_SIZE, currentBookingsPage * PAGE_SIZE);

  const updateUser = (updatedUser) => {
    setUsersResponse((current) => ({
      ...current,
      users: current.users.map((user) => (user.id === updatedUser.id ? updatedUser : user)),
    }));
  };

  const handleBlockToggle = async (targetUser) => {
    setActionError('');
    try {
      const updated = targetUser.enabled
        ? await blockUser(targetUser.id)
        : await unblockUser(targetUser.id);
      updateUser(updated);
    } catch (error) {
      setActionError(error.message || 'Action impossible sur cet utilisateur.');
    }
  };

  const handleDeleteUser = async (targetUser) => {
    const confirmed = window.confirm(t('admin_delete_user_confirm', { email: targetUser.email }));
    if (!confirmed) return;

    setActionError('');
    try {
      await deleteUserByAdmin(targetUser.id);
      setUsersResponse((current) => ({
        ...current,
        total: Math.max(0, current.total - 1),
        users: current.users.filter((user) => user.id !== targetUser.id),
      }));
    } catch (error) {
      setActionError(error.message || t('dashboard_delete_house_error'));
    }
  };

  const handleRoleChange = async (targetUser, role) => {
    setActionError('');
    try {
      const updated = await assignRole({ userId: targetUser.id, role });
      updateUser(updated);
    } catch (error) {
      setActionError(error.message || t('admin_role_change_error'));
    }
  };

  const handleDeleteHouse = async (house) => {
    const confirmed = window.confirm(t('admin_delete_house_confirm', { title: house.title }));
    if (!confirmed) return;

    setActionError('');
    try {
      await deleteHouse(house.id);
      setHouses((current) => current.filter((item) => item.id !== house.id));
    } catch (error) {
      setActionError(error.message || t('admin_delete_house_error'));
    }
  };

  const renderUsersSection = () => (
    <section className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
      <div className="grid gap-4 border-b border-gray-100 px-5 py-4 md:grid-cols-[1fr_220px] md:items-end">
        <div>
          <h3 className="font-bold text-gray-900">{t('admin_users_title')}</h3>
          <p className="text-sm text-gray-500">
            {t('admin_users_count', { filtered: filteredUsers.length, total: users.length, owners: owners.length, clients: clients.length })}
          </p>
        </div>
        <label className="grid gap-1 text-sm font-medium text-gray-700">
          {t('admin_filter_role')}
          <select
            className="min-h-11 rounded-md border border-gray-300 px-3 py-2 text-base font-normal text-gray-700"
            value={userRoleFilter}
            onChange={(event) => {
              setUserRoleFilter(event.target.value);
              setUsersPage(1);
            }}
          >
            <option value="ALL">{t('admin_all')}</option>
            <option value="PROPRIETAIRE">{t('admin_owners')}</option>
            <option value="USER">{t('admin_user_role')}</option>
          </select>
        </label>
      </div>
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <table className="min-w-[820px] divide-y divide-gray-100 text-sm sm:min-w-full">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-5 py-3">{t('admin_table_user')}</th>
              <th className="px-5 py-3">{t('admin_table_email')}</th>
              <th className="px-5 py-3">{t('admin_table_role')}</th>
              <th className="px-5 py-3">{t('admin_table_status')}</th>
              <th className="px-5 py-3 text-right">{t('admin_table_actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {paginatedUsers.map((targetUser) => (
              <tr key={targetUser.id} className="align-middle hover:bg-gray-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar user={targetUser} />
                    <div>
                      <p className="font-semibold text-gray-900">{targetUser.name || targetUser.username || t('admin_user_fallback')}</p>
                      <p className="break-all text-xs text-gray-500">{targetUser.id}</p>
                    </div>
                  </div>
                </td>
                <td className="break-all px-5 py-4 text-gray-600">{targetUser.email}</td>
                <td className="px-5 py-4">
                  <select
                    className="min-h-11 rounded-md border border-gray-300 px-3 py-1.5 text-base"
                    value={targetUser.role}
                    disabled={targetUser.id === currentUser?.id}
                    onChange={(event) => handleRoleChange(targetUser, event.target.value)}
                  >
                    <option value="USER">{t('admin_user_role')}</option>
                    <option value="PROPRIETAIRE">{t('admin_owner_role')}</option>
                  </select>
                </td>
                <td className="px-5 py-4">
                  <span className={targetUser.enabled ? 'font-medium text-green-600' : 'font-medium text-red-600'}>
                    {targetUser.enabled ? t('admin_active') : t('admin_blocked')}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button size="sm" variant="outline" disabled={targetUser.id === currentUser?.id} onClick={() => handleBlockToggle(targetUser)}>
                      {targetUser.enabled ? <Ban size={15} className="mr-1" /> : <RotateCcw size={15} className="mr-1" />}
                      {targetUser.enabled ? t('admin_block') : t('admin_unblock')}
                    </Button>
                    <Button size="sm" variant="danger" disabled={targetUser.id === currentUser?.id} onClick={() => handleDeleteUser(targetUser)}>
                      <Trash2 size={15} className="mr-1" />
                      {t('admin_delete')}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {paginatedUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-gray-500">{t('admin_no_users')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <PaginationControls page={currentUsersPage} totalItems={filteredUsers.length} onPageChange={setUsersPage} label={t('admin_users').toLowerCase()} />
    </section>
  );

  const renderHousesSection = () => (
    <section className="rounded-lg border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4">
        <h3 className="font-bold text-gray-900">{t('admin_listings')}</h3>
        <p className="text-sm text-gray-500">{t('admin_listings_count', { count: houses.length })}</p>
      </div>
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <table className="min-w-[900px] divide-y divide-gray-100 text-sm sm:min-w-full">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-5 py-3">{t('admin_table_listing')}</th>
              <th className="px-5 py-3">{t('admin_table_address')}</th>
              <th className="px-5 py-3">{t('admin_table_owner')}</th>
              <th className="px-5 py-3">{t('admin_table_status')}</th>
              <th className="px-5 py-3">{t('admin_table_price')}</th>
              <th className="px-5 py-3 text-right">{t('admin_table_actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {paginatedHouses.map((house) => {
              const owner = users.find((u) => u.id === house.userId);
              return (
              <tr key={house.id} className="align-middle hover:bg-gray-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100 text-gray-400">
                      {house.images?.[0] ? (
                        <img src={house.images[0]} alt={house.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ImageOff size={18} />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{house.title}</p>
                      <p className="break-all text-xs text-gray-500">{house.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-600">{house.location}</td>
                <td className="px-5 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{owner?.name || owner?.username || t('admin_owner_role')}</p>
                    <p className="text-xs text-gray-500">{owner?.email || '-'}</p>
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-600">{house.statutValidation || 'EN_ATTENTE'}</td>
                <td className="px-5 py-4 font-semibold text-gray-900">{formatPrice(house.price || 0)}</td>
                <td className="px-5 py-4 text-right">
                  <Button size="sm" variant="danger" onClick={() => handleDeleteHouse(house)}>
                    <Trash2 size={15} className="mr-1" />
                    {t('admin_delete')}
                  </Button>
                </td>
              </tr>
              );
            })}
            {paginatedHouses.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-gray-500">{t('admin_no_listings')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <PaginationControls page={currentHousesPage} totalItems={houses.length} onPageChange={setHousesPage} label={t('admin_listings').toLowerCase()} />
    </section>
  );

  const renderBookingsSection = () => (
    <section className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4">
        <h3 className="font-bold text-gray-900">{t('admin_bookings')}</h3>
        <p className="text-sm text-gray-500">{t('admin_bookings_count', { count: visibleBookings.length })}</p>
      </div>
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <table className="min-w-[860px] divide-y divide-gray-100 text-sm sm:min-w-full">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-5 py-3">{t('admin_table_booking')}</th>
              <th className="px-5 py-3">{t('admin_table_user')}</th>
              <th className="px-5 py-3">{t('admin_table_listing')}</th>
              <th className="px-5 py-3">{t('admin_table_start_date')}</th>
              <th className="px-5 py-3">{t('admin_table_end_date')}</th>
              <th className="px-5 py-3">{t('admin_table_status')}</th>
              <th className="px-5 py-3">{t('admin_table_total_price')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {paginatedBookings.map((booking, index) => {
              const bookingUser = users.find((u) => u.id === booking.userId);
              const bookingIndex = (currentBookingsPage - 1) * PAGE_SIZE + index + 1;
              return (
              <tr key={booking.id} className="align-middle hover:bg-gray-50">
                <td className="px-5 py-4 font-semibold text-gray-900">{t('dashboard_reservation_label', { number: bookingIndex })}</td>
                <td className="px-5 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{bookingUser?.name || bookingUser?.username || t('admin_user_fallback')}</p>
                    <p className="text-xs text-gray-500">{bookingUser?.email || '-'}</p>
                  </div>
                </td>
                <td className="break-all px-5 py-4 text-xs text-gray-600 font-mono">{booking.houseId}</td>
                <td className="px-5 py-4 text-gray-600">{booking.startDate}</td>
                <td className="px-5 py-4 text-gray-600">{booking.endDate}</td>
                <td className="px-5 py-4">
                  <span className={`font-medium ${
                    booking.status === 'CONFIRMED' ? 'text-green-600' :
                    booking.status === 'PENDING' ? 'text-yellow-600' :
                    booking.status === 'CANCELLED' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-5 py-4 font-semibold text-gray-900">{formatPrice(booking.totalPrice || 0)}</td>
              </tr>
              );
            })}
            {paginatedBookings.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-gray-500">{t('admin_no_bookings')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <PaginationControls page={currentBookingsPage} totalItems={visibleBookings.length} onPageChange={setBookingsPage} label={t('admin_bookings_count', { count: '' }).trim()} />
    </section>
  );

  const renderOverview = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title={t('admin_users')} value={usersResponse.total || usersResponse.users.length} icon={<Users size={24} />} colorClass={STAT_COLORS.blue} />
        <StatCard title={t('admin_listings')} value={houses.length} icon={<Home size={24} />} colorClass={STAT_COLORS.purple} />
        <StatCard title={t('admin_bookings')} value={visibleBookings.length} icon={<Calendar size={24} />} colorClass={STAT_COLORS.orange} />
        <StatCard title={t('admin_revenue')} value={formatPrice(totalRevenue)} icon={<DollarSign size={24} />} colorClass={STAT_COLORS.green} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm sm:p-6 lg:col-span-2">
          <h3 className="text-lg font-bold mb-6">{t('admin_bookings_last_days')}</h3>
          <div className="h-64 flex items-end justify-between gap-4">
            {chartData.map((d, i) => (
              <div key={i} className="flex flex-col items-center flex-1 group">
                <div className="w-full bg-blue-100 rounded-t-md relative group-hover:bg-primary transition-colors" style={{ height: `${Math.max(8, (d.bookings / Math.max(1, houses.length)) * 100)}%` }}>
                   <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">{d.bookings}</div>
                </div>
                <span className="text-xs text-gray-500 mt-2">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
          <h3 className="text-lg font-bold mb-6">{t('admin_top_listings')}</h3>
          <div className="space-y-4">
            {houses.slice(0, 3).map((house) => (
              <div key={house.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden text-gray-400">
                  {house.images?.[0] ? (
                    <img src={house.images[0]} alt={house.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageOff size={18} />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm line-clamp-1">{house.title}</h4>
                  <p className="text-xs text-gray-500">{house.statutValidation || 'EN_ATTENTE'}</p>
                </div>
              </div>
            ))}
            {houses.length === 0 && <p className="text-sm text-gray-500">{t('admin_no_listings')}</p>}
          </div>
        </div>
      </div>
    </>
  );

  const pageTitle = {
    overview: t('admin_title'),
    users: t('admin_users'),
    houses: t('admin_listings'),
    bookings: t('admin_bookings'),
  }[section];

  return (
    <div className="dashboard-shell min-h-[calc(100vh-140px)]">
      {/* Sidebar Admin */}
      <aside className="dashboard-desktop-menu w-64 flex-col bg-gray-900 text-white">
        <div className="p-6">
          <h2 className="text-xl font-bold">HouseBooker Admin</h2>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === ROUTES.ADMIN}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-800'}`
                }
              >
                <Icon size={18} /> {t(item.labelKey)}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="dashboard-mobile-menu sticky top-16 z-30 border-b border-gray-200 bg-white/95 px-3 py-3 shadow-sm backdrop-blur">
        <div className="flex snap-x gap-2 overflow-x-auto pb-1">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === ROUTES.ADMIN}
              className={({ isActive }) =>
                `inline-flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold shadow-sm transition ${isActive ? 'border-primary bg-primary text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-primary/40 hover:text-primary'}`
              }
            >
              <Icon size={16} />
              {t(item.labelKey)}
            </NavLink>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{pageTitle}</h1>
          <p className="text-gray-500">{t('admin_subtitle')}</p>
        </div>

        {loading && <Loader />}
        {actionError && <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</div>}

        {section === 'overview' && renderOverview()}
        {section === 'users' && renderUsersSection()}
        {section === 'houses' && renderHousesSection()}
        {section === 'bookings' && renderBookingsSection()}
      </main>
    </div>
  );
};

export default DashboardAdminPage;
