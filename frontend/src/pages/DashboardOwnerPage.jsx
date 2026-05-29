import { Fragment, useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { formatPrice } from '../utils/formatters';
import { Home, Calendar, Users, DollarSign, Settings, MessageSquare, Star, Plus, Edit3, Trash2, X, Eye } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import Button from '../components/ui/Button';
import StatCard from '../components/common/StatCard';
import Loader from '../components/ui/Loader';
import PaginationControls, { PAGE_SIZE } from '../components/common/PaginationControls';
import { useAuth } from '../hooks/useAuth';
import { deleteHouse, getOwnerHouses, updateHouse } from '../services/houseApi';
import { cancelBookingByOwner, deleteBookingByOwner, getOwnerBookings } from '../services/bookingApi';
import { getAuthenticatedUserId } from '../utils/authUser';

const TYPES_WITH_ROOMS = new Set(['maison', 'appartement', 'villa']);
const HIDDEN_BOOKING_STATUSES = new Set(['CANCELLED', 'CANCELED', 'cancelled', 'canceled', 'annulée']);
const CANCELLABLE_BOOKING_STATUSES = new Set(['PENDING', 'CONFIRMED']);

const getBookingStatusClass = (status) => (
  status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
  status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
  status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
  'bg-gray-100 text-gray-700'
);

const toNullableNumber = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  return Number(value);
};

const toEditForm = (house) => ({
  titre: house.title || '',
  description: house.description || '',
  adresse: house.location || '',
  type: String(house.type || 'maison').toUpperCase(),
  prix: house.price || '',
  nombreChambres: house.rooms ?? '',
  nombreCuisines: house.kitchens ?? '',
  nombreSallesBain: house.bathrooms ?? '',
  nombreToilettes: house.toilets ?? '',
  disponible: Boolean(house.disponible),
});

const getVisibleCounts = (house) => {
  const isRoomType = String(house.type || '').toLowerCase() === 'chambre';

  return {
    rooms: !isRoomType && Number(house.rooms) > 0,
    kitchens: Number(house.kitchens) > 0,
    bathrooms: Number(house.bathrooms) > 0,
    toilets: Number(house.toilets) > 0,
  };
};

const DashboardOwnerPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const userId = getAuthenticatedUserId(user);
  const getRouteTab = (pathname) => {
    if (pathname === ROUTES.MY_HOUSES) return 'listings';
    if (pathname === ROUTES.MY_BOOKINGS) return 'bookings';
    return 'overview';
  };
  const [activeTab, setActiveTab] = useState(getRouteTab(location.pathname)); // overview, bookings, listings
  const currentTab = getRouteTab(location.pathname) === 'overview' ? activeTab : getRouteTab(location.pathname);
  const [houses, setHouses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingHouseId, setEditingHouseId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [actionError, setActionError] = useState('');
  const [bookingActionId, setBookingActionId] = useState('');
  const [listingsPage, setListingsPage] = useState(1);
  const [bookingsPage, setBookingsPage] = useState(1);

  useEffect(() => {
    let mounted = true;

    const loadOwnerData = async () => {
      setLoading(true);
      const ownerHousesResult = await getOwnerHouses(userId)
        .then((value) => ({ status: 'fulfilled', value }))
        .catch((reason) => ({ status: 'rejected', reason }));

      const ownerHouses = ownerHousesResult.status === 'fulfilled' ? ownerHousesResult.value : [];
      const ownerBookingsResult = await getOwnerBookings(userId)
        .then((value) => ({ status: 'fulfilled', value }))
        .catch((reason) => ({ status: 'rejected', reason }));

      if (mounted) {
        setHouses(ownerHouses);
        setBookings(ownerBookingsResult.status === 'fulfilled' ? ownerBookingsResult.value : []);
        setLoading(false);
      }
    };

    loadOwnerData();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const setDashboardTab = (tab) => {
    setActiveTab(tab);
    if (tab === 'listings') {
      navigate(ROUTES.MY_HOUSES);
    } else if (tab === 'bookings') {
      navigate(ROUTES.MY_BOOKINGS);
    } else if (tab === 'overview' && location.pathname !== ROUTES.DASHBOARD) {
      navigate(ROUTES.DASHBOARD);
    }
  };

  const startEdit = (house) => {
    setActionError('');
    setEditingHouseId(house.id);
    setEditForm(toEditForm(house));
  };

  const updateEditField = (field, value) => {
    setEditForm((current) => ({ ...current, [field]: value }));
  };

  const cancelEdit = () => {
    setEditingHouseId(null);
    setEditForm(null);
    setActionError('');
  };

  const saveEdit = async (houseId) => {
    setActionError('');
    try {
      const type = editForm.type;
      const updated = await updateHouse(houseId, {
        titre: editForm.titre.trim(),
        description: editForm.description.trim(),
        adresse: editForm.adresse.trim(),
        type,
        prix: Number(editForm.prix),
        nombreChambres: TYPES_WITH_ROOMS.has(type.toLowerCase()) ? toNullableNumber(editForm.nombreChambres) : null,
        nombreCuisines: toNullableNumber(editForm.nombreCuisines),
        nombreSallesBain: toNullableNumber(editForm.nombreSallesBain),
        nombreToilettes: toNullableNumber(editForm.nombreToilettes),
        disponible: editForm.disponible,
      });
      setHouses((current) =>
        current
          .map((house) => (house.id === houseId ? updated : house))
      );
      cancelEdit();
    } catch (error) {
      setActionError(error.message || t('dashboard_listing_update_error'));
    }
  };

  const removeHouse = async (houseId) => {
    const confirmed = window.confirm(t('dashboard_delete_house_confirm'));
    if (!confirmed) return;

    setActionError('');
    try {
      await deleteHouse(houseId);
      setHouses((current) => current.filter((house) => house.id !== houseId));
      if (editingHouseId === houseId) {
        cancelEdit();
      }
    } catch (error) {
      setActionError(error.message || t('dashboard_delete_house_error'));
    }
  };

  const cancelOwnerBooking = async (booking) => {
    if (!CANCELLABLE_BOOKING_STATUSES.has(booking.status)) return;
    const confirmed = window.confirm(t('dashboard_cancel_booking_confirm'));
    if (!confirmed) return;

    setBookingActionId(booking.id);
    setActionError('');
    try {
      const cancelled = await cancelBookingByOwner({ bookingId: booking.id, ownerId: userId });
      setBookings((current) => current.filter((item) => item.id !== cancelled.id));
    } catch (error) {
      setActionError(error.message || t('dashboard_cancel_booking_error'));
    } finally {
      setBookingActionId('');
    }
  };

  const removeOwnerBooking = async (booking) => {
    const confirmed = window.confirm(t('dashboard_delete_booking_confirm'));
    if (!confirmed) return;

    setBookingActionId(booking.id);
    setActionError('');
    try {
      await deleteBookingByOwner({ bookingId: booking.id, ownerId: userId });
      setBookings((current) => current.filter((item) => item.id !== booking.id));
    } catch (error) {
      setActionError(error.message || t('dashboard_delete_booking_error'));
    } finally {
      setBookingActionId('');
    }
  };

  const visibleBookings = useMemo(() => (
    [...bookings]
      .filter((booking) => !HIDDEN_BOOKING_STATUSES.has(booking.status))
      .sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate))
  ), [bookings]);

  const chartData = useMemo(() => {
    const counts = visibleBookings.slice(0, 5).map((booking, index) => ({
      name: booking.startDate || `#${index + 1}`,
      bookings: 1,
    }));
    return counts.length ? counts : [{ name: 'Backend', bookings: 0 }];
  }, [visibleBookings]);

  const monthlyRevenue = visibleBookings.reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0);
  const listingsTotalPages = Math.max(1, Math.ceil(houses.length / PAGE_SIZE));
  const bookingsTotalPages = Math.max(1, Math.ceil(visibleBookings.length / PAGE_SIZE));
  const currentListingsPage = Math.min(listingsPage, listingsTotalPages);
  const currentBookingsPage = Math.min(bookingsPage, bookingsTotalPages);
  const paginatedHouses = houses.slice((currentListingsPage - 1) * PAGE_SIZE, currentListingsPage * PAGE_SIZE);
  const paginatedBookings = visibleBookings.slice((currentBookingsPage - 1) * PAGE_SIZE, currentBookingsPage * PAGE_SIZE);

  return (
    <div className="dashboard-shell min-h-[calc(100vh-140px)]">
      {/* Sidebar */}
      <aside className="dashboard-desktop-menu w-64 flex-col border-r border-gray-200 bg-white">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900">{t('dashboard_owner_role')}</h2>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button onClick={() => setDashboardTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${currentTab === 'overview' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Home size={18} /> {t('dashboard_owner_overview')}
          </button>
          <button onClick={() => setDashboardTab('listings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${currentTab === 'listings' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Home size={18} /> {t('dashboard_owner_listings')}
          </button>
          <button onClick={() => setDashboardTab('bookings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${currentTab === 'bookings' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Calendar size={18} /> {t('dashboard_bookings')}
          </button>
          <Link to={ROUTES.MESSAGES} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">
            <MessageSquare size={18} /> {t('msg_title')} <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">2</span>
          </Link>
          <Link to={ROUTES.REVIEWS} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">
            <Star size={18} /> {t('review_title')}
          </Link>
        </nav>
        <div className="p-4 border-t">
          <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">
            <Settings size={18} /> {t('dashboard_owner_settings')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="dashboard-mobile-menu sticky top-16 z-30 border-b border-gray-200 bg-white/95 px-3 py-3 shadow-sm backdrop-blur">
        <div className="flex snap-x gap-2 overflow-x-auto pb-1">
          <button onClick={() => setDashboardTab('overview')} className={`inline-flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold shadow-sm transition ${currentTab === 'overview' ? 'border-primary bg-primary text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-primary/40 hover:text-primary'}`}>
            <Home size={16} />
            {t('dashboard_owner_overview')}
          </button>
          <button onClick={() => setDashboardTab('listings')} className={`inline-flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold shadow-sm transition ${currentTab === 'listings' ? 'border-primary bg-primary text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-primary/40 hover:text-primary'}`}>
            <Home size={16} />
            {t('dashboard_owner_listings')}
          </button>
          <button onClick={() => setDashboardTab('bookings')} className={`inline-flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold shadow-sm transition ${currentTab === 'bookings' ? 'border-primary bg-primary text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-primary/40 hover:text-primary'}`}>
            <Calendar size={16} />
            {t('dashboard_bookings')}
          </button>
        </div>
      </div>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{t('dashboard_title')}</h1>
            <p className="text-gray-500">{t('dashboard_subtitle')}</p>
          </div>
          <Button as={Link} to={ROUTES.ADD_HOUSE}>
            <Plus size={18} className="mr-2" />
            {t('dashboard_add_listing')}
          </Button>
        </div>

        {loading && <Loader />}

        {currentTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard title={t('dashboard_listings')} value={houses.length} icon={<Home size={24} />} />
              <StatCard title={t('dashboard_bookings')} value={visibleBookings.length} icon={<Calendar size={24} />} colorClass="bg-green-50 text-green-600" />
              <StatCard title={t('dashboard_occupancy')} value="0%" icon={<Users size={24} />} colorClass="bg-green-50 text-green-600" />
              <StatCard title={t('dashboard_revenue')} value={formatPrice(monthlyRevenue)} icon={<DollarSign size={24} />} colorClass="bg-green-50 text-green-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 lg:col-span-2 lg:rounded-2xl">
                <h3 className="text-lg font-bold mb-6">{t('dashboard_chart_title')}</h3>
                <div className="h-64 flex items-end justify-between gap-2">
                  {chartData.map((d, i) => (
                    <div key={i} className="flex flex-col items-center flex-1 group">
                      <div className="w-full bg-blue-100 rounded-t-sm relative group-hover:bg-primary transition-colors" style={{ height: `${Math.max(8, (d.bookings / Math.max(1, visibleBookings.length)) * 100)}%` }}>
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">{d.bookings}</div>
                      </div>
                      <span className="text-xs text-gray-500 mt-2 rotate-45 md:rotate-0">{d.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 lg:rounded-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold">{t('dashboard_recent')}</h3>
                  <a href="#" className="text-sm text-primary hover:underline">{t('dashboard_view_all')}</a>
                </div>
                <div className="space-y-4">
                  {visibleBookings.slice(0, PAGE_SIZE).map(booking => (
                    <div key={booking.id} className="flex flex-col p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold text-sm line-clamp-1">{booking.houseId}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getBookingStatusClass(booking.status)}`}>
                          {booking.status === 'CONFIRMED' ? t('dashboard_confirmed') : t('dashboard_pending')}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 mb-1">{booking.userId}</span>
                      <span className="text-xs text-gray-400">{booking.startDate} - {booking.endDate}</span>
                    </div>
                  ))}
                  {visibleBookings.length === 0 && <p className="text-sm text-gray-500">{t('dashboard_no_recent_bookings')}</p>}
                </div>
              </div>
            </div>
          </>
        )}

        {currentTab === 'listings' && (
          <div className="space-y-4">
            {actionError && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {actionError}
              </div>
            )}
            <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
              <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                <table className="min-w-[900px] divide-y divide-gray-100 text-sm sm:min-w-full">
                  <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-5 py-3">{t('dashboard_table_listing')}</th>
                      <th className="px-5 py-3">{t('dashboard_table_address')}</th>
                      <th className="px-5 py-3">{t('dashboard_table_details')}</th>
                      <th className="px-5 py-3">{t('dashboard_table_status')}</th>
                      <th className="px-5 py-3">{t('dashboard_table_price')}</th>
                      <th className="px-5 py-3 text-right">{t('dashboard_table_actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
              {paginatedHouses.map((house) => {
                const visibleCounts = getVisibleCounts(house);
                const hasVisibleCounts = Object.values(visibleCounts).some(Boolean);

                return (
                <Fragment key={house.id}>
                  <tr className="align-middle hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-16 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100">
                          {house.images?.[0] ? (
                            <img src={house.images[0]} alt={house.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-gray-400">{t('dashboard_no_photo')}</div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{house.title}</p>
                          <p className="break-all text-xs text-gray-500">{house.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{house.location}</td>
                    <td className="px-5 py-4 text-gray-600">
                      {hasVisibleCounts ? (
                        <div className="grid min-w-40 gap-1">
                          {visibleCounts.rooms && <span>{house.rooms} {t('common_rooms')}</span>}
                          {visibleCounts.kitchens && <span>{house.kitchens} {t('common_kitchens')}</span>}
                          {visibleCounts.bathrooms && <span>{house.bathrooms} {t('common_bathrooms')}</span>}
                          {visibleCounts.toilets && <span>{house.toilets} {t('common_toilets')}</span>}
                        </div>
                      ) : t('dashboard_not_provided')}
                    </td>
                    <td className="px-5 py-4 text-gray-600">{house.disponible ? t('dashboard_available') : t('dashboard_unavailable')}</td>
                    <td className="px-5 py-4 font-semibold text-gray-900">{formatPrice(house.price || 0)}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button as={Link} to={ROUTES.HOUSE_DETAIL_LINK(house.id)} size="sm" variant="outline">
                          <Eye size={15} className="mr-1" />
                          {t('dashboard_detail')}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => startEdit(house)}>
                          <Edit3 size={15} className="mr-1" />
                          {t('dashboard_edit')}
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => removeHouse(house.id)}>
                          <Trash2 size={15} className="mr-1" />
                          {t('dashboard_delete')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {editingHouseId === house.id && editForm && (
                    <tr>
                      <td colSpan={6} className="bg-gray-50 px-5 py-5">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">{t('dashboard_edit_listing')}</h3>
                            <button type="button" onClick={cancelEdit} className="flex min-h-11 min-w-11 items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100">
                              <X size={18} />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <input className="min-h-11 rounded-md border border-gray-300 px-3 py-2 text-base" value={editForm.titre} onChange={(event) => updateEditField('titre', event.target.value)} />
                            <input className="min-h-11 rounded-md border border-gray-300 px-3 py-2 text-base" value={editForm.adresse} onChange={(event) => updateEditField('adresse', event.target.value)} />
                            <select className="min-h-11 rounded-md border border-gray-300 px-3 py-2 text-base" value={editForm.type} onChange={(event) => updateEditField('type', event.target.value)}>
                              <option value="MAISON">Maison</option>
                              <option value="APPARTEMENT">Appartement</option>
                              <option value="STUDIO">Studio</option>
                              <option value="CHAMBRE">Chambre</option>
                              <option value="VILLA">Villa</option>
                            </select>
                            <input className="min-h-11 rounded-md border border-gray-300 px-3 py-2 text-base" type="number" min="1" value={editForm.prix} onChange={(event) => updateEditField('prix', event.target.value)} />
                            {TYPES_WITH_ROOMS.has(editForm.type.toLowerCase()) && (
                              <input className="min-h-11 rounded-md border border-gray-300 px-3 py-2 text-base" type="number" min="1" placeholder={t('common_rooms')} value={editForm.nombreChambres} onChange={(event) => updateEditField('nombreChambres', event.target.value)} />
                            )}
                            <input className="min-h-11 rounded-md border border-gray-300 px-3 py-2 text-base" type="number" min="0" placeholder={t('common_kitchens')} value={editForm.nombreCuisines} onChange={(event) => updateEditField('nombreCuisines', event.target.value)} />
                            <input className="min-h-11 rounded-md border border-gray-300 px-3 py-2 text-base" type="number" min="0" placeholder={t('common_bathrooms')} value={editForm.nombreSallesBain} onChange={(event) => updateEditField('nombreSallesBain', event.target.value)} />
                            <input className="min-h-11 rounded-md border border-gray-300 px-3 py-2 text-base" type="number" min="0" placeholder={t('common_toilets')} value={editForm.nombreToilettes} onChange={(event) => updateEditField('nombreToilettes', event.target.value)} />
                          </div>
                          <textarea className="min-h-24 w-full rounded-md border border-gray-300 px-3 py-2 text-base" rows={3} value={editForm.description} onChange={(event) => updateEditField('description', event.target.value)} />
                          <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input type="checkbox" checked={editForm.disponible} onChange={(event) => updateEditField('disponible', event.target.checked)} />
                            {t('dashboard_available')}
                          </label>
                          <div className="flex flex-col gap-2 sm:flex-row">
                            <Button size="sm" onClick={() => saveEdit(house.id)}>{t('dashboard_save')}</Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit}>{t('dashboard_cancel')}</Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
                );
              })}
                    {paginatedHouses.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-gray-500">{t('dashboard_no_owner_listings')}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <PaginationControls page={currentListingsPage} totalItems={houses.length} onPageChange={setListingsPage} label={t('dashboard_listings').toLowerCase()} />
            </div>
          </div>
        )}

        {currentTab === 'bookings' && (
          <div className="space-y-4">
            {actionError && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {actionError}
              </div>
            )}
            <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
              <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                <table className="min-w-[920px] divide-y divide-gray-100 text-sm sm:min-w-full">
                  <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-5 py-3">{t('dashboard_table_booking')}</th>
                      <th className="px-5 py-3">{t('dashboard_table_listing')}</th>
                      <th className="px-5 py-3">{t('dashboard_table_client')}</th>
                      <th className="px-5 py-3">{t('dashboard_table_dates')}</th>
                      <th className="px-5 py-3">{t('dashboard_table_status')}</th>
                      <th className="px-5 py-3">{t('dashboard_table_amount')}</th>
                      <th className="px-5 py-3 text-right">{t('dashboard_table_actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {paginatedBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="break-all px-5 py-4 font-medium text-gray-900">{booking.id}</td>
                        <td className="break-all px-5 py-4 text-gray-600">{booking.houseId}</td>
                        <td className="break-all px-5 py-4 text-xs text-gray-500">{booking.userId}</td>
                        <td className="px-5 py-4 text-gray-600">{booking.startDate} - {booking.endDate}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getBookingStatusClass(booking.status)}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-semibold text-gray-900">{formatPrice(booking.totalPrice || 0)}</td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap justify-end gap-2">
                            {CANCELLABLE_BOOKING_STATUSES.has(booking.status) && (
                              <Button
                                size="sm"
                                variant="outline"
                                isLoading={bookingActionId === booking.id}
                                onClick={() => cancelOwnerBooking(booking)}
                              >
                                <X size={15} className="mr-1" />
                                {t('dashboard_cancel')}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="danger"
                              isLoading={bookingActionId === booking.id}
                              onClick={() => removeOwnerBooking(booking)}
                            >
                              <Trash2 size={15} className="mr-1" />
                              {t('dashboard_delete')}
                            </Button>
                          </div>
                        </td>
                    </tr>
                  ))}
                  {paginatedBookings.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-gray-500">{t('dashboard_no_active_bookings')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
              </div>
              <PaginationControls page={currentBookingsPage} totalItems={visibleBookings.length} onPageChange={setBookingsPage} label={t('admin_bookings_count', { count: '' }).trim()} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardOwnerPage;
