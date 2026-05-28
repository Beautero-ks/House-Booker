import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { formatPrice } from '../utils/formatters';
import { Home, Calendar, Users, DollarSign, Settings, MessageSquare, Star, Plus, Edit3, Trash2, X, Eye } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import Button from '../components/ui/Button';
import StatCard from '../components/common/StatCard';
import Loader from '../components/ui/Loader';
import { useAuth } from '../hooks/useAuth';
import { deleteHouse, getOwnerHouses, updateHouse } from '../services/houseApi';
import { getMyBookings } from '../services/bookingApi';
import { getAuthenticatedUserId } from '../utils/authUser';

const TYPES_WITH_ROOMS = new Set(['maison', 'appartement', 'villa']);

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
  const [activeTab, setActiveTab] = useState(location.pathname === ROUTES.MY_HOUSES ? 'listings' : 'overview'); // overview, bookings, listings
  const currentTab = location.pathname === ROUTES.MY_HOUSES ? 'listings' : activeTab;
  const [houses, setHouses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingHouseId, setEditingHouseId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadOwnerData = async () => {
      setLoading(true);
      const [ownerHousesResult, myBookingsResult] = await Promise.allSettled([
        getOwnerHouses(userId),
        getMyBookings({ userId }),
      ]);

      if (mounted) {
        setHouses(ownerHousesResult.status === 'fulfilled' ? ownerHousesResult.value : []);
        setBookings(myBookingsResult.status === 'fulfilled' ? myBookingsResult.value : []);
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
    } else if (location.pathname === ROUTES.MY_HOUSES) {
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
      setActionError(error.message || 'Modification impossible.');
    }
  };

  const removeHouse = async (houseId) => {
    const confirmed = window.confirm('Voulez-vous vraiment supprimer ce logement ?');
    if (!confirmed) return;

    setActionError('');
    try {
      await deleteHouse(houseId);
      setHouses((current) => current.filter((house) => house.id !== houseId));
      if (editingHouseId === houseId) {
        cancelEdit();
      }
    } catch (error) {
      setActionError(error.message || 'Suppression impossible.');
    }
  };

  const chartData = useMemo(() => {
    const counts = bookings.slice(0, 5).map((booking, index) => ({
      name: booking.startDate || `#${index + 1}`,
      bookings: 1,
    }));
    return counts.length ? counts : [{ name: 'Backend', bookings: 0 }];
  }, [bookings]);

  const monthlyRevenue = bookings.reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0);

  return (
    <div className="flex min-h-[calc(100vh-140px)]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
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
      <main className="flex-1 p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('dashboard_title')}</h1>
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
              <StatCard title={t('dashboard_bookings')} value={bookings.length} icon={<Calendar size={24} />} colorClass="bg-green-50 text-green-600" />
              <StatCard title={t('dashboard_occupancy')} value="0%" icon={<Users size={24} />} colorClass="bg-green-50 text-green-600" />
              <StatCard title={t('dashboard_revenue')} value={formatPrice(monthlyRevenue)} icon={<DollarSign size={24} />} colorClass="bg-green-50 text-green-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-6">{t('dashboard_chart_title')}</h3>
                <div className="h-64 flex items-end justify-between gap-2">
                  {chartData.map((d, i) => (
                    <div key={i} className="flex flex-col items-center flex-1 group">
                      <div className="w-full bg-blue-100 rounded-t-sm relative group-hover:bg-primary transition-colors" style={{ height: `${Math.max(8, (d.bookings / Math.max(1, bookings.length)) * 100)}%` }}>
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">{d.bookings}</div>
                      </div>
                      <span className="text-xs text-gray-500 mt-2 rotate-45 md:rotate-0">{d.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold">{t('dashboard_recent')}</h3>
                  <a href="#" className="text-sm text-primary hover:underline">{t('dashboard_view_all')}</a>
                </div>
                <div className="space-y-4">
                  {bookings.map(booking => (
                    <div key={booking.id} className="flex flex-col p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold text-sm line-clamp-1">{booking.houseId}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {booking.status === 'CONFIRMED' ? t('dashboard_confirmed') : t('dashboard_pending')}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 mb-1">{booking.userId}</span>
                      <span className="text-xs text-gray-400">{booking.startDate} - {booking.endDate}</span>
                    </div>
                  ))}
                  {bookings.length === 0 && <p className="text-sm text-gray-500">Aucune réservation retournée par le backend.</p>}
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
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {houses.map((house) => {
                const visibleCounts = getVisibleCounts(house);
                const hasVisibleCounts = Object.values(visibleCounts).some(Boolean);

                return (
                <div key={house.id} className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                  {editingHouseId === house.id && editForm ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Modifier le logement</h3>
                        <button type="button" onClick={cancelEdit} className="rounded-md p-2 text-gray-500 hover:bg-gray-100">
                          <X size={18} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={editForm.titre} onChange={(event) => updateEditField('titre', event.target.value)} />
                        <input className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={editForm.adresse} onChange={(event) => updateEditField('adresse', event.target.value)} />
                        <select className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={editForm.type} onChange={(event) => updateEditField('type', event.target.value)}>
                          <option value="MAISON">Maison</option>
                          <option value="APPARTEMENT">Appartement</option>
                          <option value="STUDIO">Studio</option>
                          <option value="CHAMBRE">Chambre</option>
                          <option value="VILLA">Villa</option>
                        </select>
                        <input className="rounded-md border border-gray-300 px-3 py-2 text-sm" type="number" min="1" value={editForm.prix} onChange={(event) => updateEditField('prix', event.target.value)} />
                        {TYPES_WITH_ROOMS.has(editForm.type.toLowerCase()) && (
                          <input className="rounded-md border border-gray-300 px-3 py-2 text-sm" type="number" min="1" placeholder="Chambres" value={editForm.nombreChambres} onChange={(event) => updateEditField('nombreChambres', event.target.value)} />
                        )}
                        <input className="rounded-md border border-gray-300 px-3 py-2 text-sm" type="number" min="0" placeholder="Cuisines" value={editForm.nombreCuisines} onChange={(event) => updateEditField('nombreCuisines', event.target.value)} />
                        <input className="rounded-md border border-gray-300 px-3 py-2 text-sm" type="number" min="0" placeholder="Salles de bain" value={editForm.nombreSallesBain} onChange={(event) => updateEditField('nombreSallesBain', event.target.value)} />
                        <input className="rounded-md border border-gray-300 px-3 py-2 text-sm" type="number" min="0" placeholder="Toilettes" value={editForm.nombreToilettes} onChange={(event) => updateEditField('nombreToilettes', event.target.value)} />
                      </div>
                      <textarea className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" rows={3} value={editForm.description} onChange={(event) => updateEditField('description', event.target.value)} />
                      <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={editForm.disponible} onChange={(event) => updateEditField('disponible', event.target.checked)} />
                        Disponible
                      </label>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveEdit(house.id)}>Enregistrer</Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>Annuler</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-4">
                      <div className="aspect-[4/3] overflow-hidden rounded-md bg-gray-100">
                        {house.images?.[0] ? (
                          <img src={house.images[0]} alt={house.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-gray-400">Aucune photo</div>
                        )}
                      </div>
                      <div className="flex flex-col justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">{house.title}</h3>
                          <p className="mt-1 text-sm text-gray-500">{house.location}</p>
                          {hasVisibleCounts && (
                            <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-600">
                              {visibleCounts.rooms && <span>{house.rooms} {t('common_rooms')}</span>}
                              {visibleCounts.kitchens && <span>{house.kitchens} {t('common_kitchens')}</span>}
                              {visibleCounts.bathrooms && <span>{house.bathrooms} {t('common_bathrooms')}</span>}
                              {visibleCounts.toilets && <span>{house.toilets} {t('common_toilets')}</span>}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button as={Link} to={ROUTES.HOUSE_DETAIL_LINK(house.id)} size="sm" variant="outline">
                            <Eye size={15} className="mr-1" />
                            Détail
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => startEdit(house)}>
                            <Edit3 size={15} className="mr-1" />
                            Modifier
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => removeHouse(house.id)}>
                            <Trash2 size={15} className="mr-1" />
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                );
              })}
            </div>
            {houses.length === 0 && <p className="text-gray-500">Aucun logement propriétaire retourné par le backend.</p>}
          </div>
        )}

        {currentTab === 'bookings' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {bookings.map((booking) => (
              <div key={booking.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 border-b p-4 text-sm">
                <span className="font-medium">{booking.id}</span>
                <span>{booking.houseId}</span>
                <span>{booking.startDate} - {booking.endDate}</span>
                <span>{booking.status}</span>
                <span className="font-semibold">{formatPrice(booking.totalPrice || 0)}</span>
              </div>
            ))}
            {bookings.length === 0 && (
              <div className="p-8 text-center text-gray-500">Aucune réservation retournée par le backend.</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardOwnerPage;
