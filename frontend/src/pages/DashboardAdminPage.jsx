import { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { formatPrice } from '../utils/formatters';
import { Users, Home, Calendar, DollarSign, Activity, ImageOff, Ban, RotateCcw, Trash2 } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import Loader from '../components/ui/Loader';
import Button from '../components/ui/Button';
import { assignRole, blockUser, deleteUserByAdmin, getUsers, unblockUser } from '../services/adminApi';
import { deleteHouse, getHouses } from '../services/houseApi';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/routes';

const STAT_COLORS = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  purple: 'bg-purple-50 text-purple-600',
  orange: 'bg-orange-50 text-orange-600',
};

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
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      setLoading(true);
      try {
        const [users, logements] = await Promise.all([
          getUsers({ page: 0, size: 100 }),
          getHouses(),
        ]);
        if (mounted) {
          setUsersResponse(users);
          setHouses(logements);
        }
      } catch {
        if (mounted) {
          setUsersResponse({ users: [], total: 0 });
          setHouses([]);
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
      { name: 'Validés', bookings: valid },
      { name: 'En attente', bookings: pending },
      { name: 'Rejetés', bookings: rejected },
    ];
  }, [houses]);

  const totalRevenue = 0;
  const owners = usersResponse.users.filter((user) => user.role === 'PROPRIETAIRE');
  const clients = usersResponse.users.filter((user) => user.role === 'USER');

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
    const confirmed = window.confirm(`Supprimer définitivement ${targetUser.email} ?`);
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
      setActionError(error.message || 'Suppression impossible.');
    }
  };

  const handleRoleChange = async (targetUser, role) => {
    setActionError('');
    try {
      const updated = await assignRole({ userId: targetUser.id, role });
      updateUser(updated);
    } catch (error) {
      setActionError(error.message || 'Changement de rôle impossible.');
    }
  };

  const handleDeleteHouse = async (house) => {
    const confirmed = window.confirm(`Supprimer le logement "${house.title}" ?`);
    if (!confirmed) return;

    setActionError('');
    try {
      await deleteHouse(house.id);
      setHouses((current) => current.filter((item) => item.id !== house.id));
    } catch (error) {
      setActionError(error.message || 'Suppression du logement impossible.');
    }
  };

  const renderUsersSection = () => (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
      <section className="rounded-lg border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h3 className="font-bold text-gray-900">Propriétaires</h3>
          <p className="text-sm text-gray-500">{owners.length} compte(s)</p>
        </div>
        <div className="divide-y divide-gray-100">
          {owners.map((owner) => (
            <div key={owner.id} className="grid grid-cols-1 gap-3 px-5 py-4 text-sm md:grid-cols-[1fr_auto] md:items-center">
              <div className="flex items-center gap-3">
                <UserAvatar user={owner} />
                <div>
                  <p className="font-semibold text-gray-900">{owner.name}</p>
                  <p className="text-gray-500">{owner.email}</p>
                  <p className={owner.enabled ? 'text-green-600' : 'text-red-600'}>{owner.enabled ? 'Actif' : 'Bloqué'}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                  value={owner.role}
                  disabled={owner.id === currentUser?.id}
                  onChange={(event) => handleRoleChange(owner, event.target.value)}
                >
                  <option value="USER">User</option>
                  <option value="PROPRIETAIRE">Propriétaire</option>
                </select>
                <Button size="sm" variant="outline" disabled={owner.id === currentUser?.id} onClick={() => handleBlockToggle(owner)}>
                  {owner.enabled ? <Ban size={15} className="mr-1" /> : <RotateCcw size={15} className="mr-1" />}
                  {owner.enabled ? 'Bloquer' : 'Débloquer'}
                </Button>
                <Button size="sm" variant="danger" disabled={owner.id === currentUser?.id} onClick={() => handleDeleteUser(owner)}>
                  <Trash2 size={15} className="mr-1" />
                  Supprimer
                </Button>
              </div>
            </div>
          ))}
          {owners.length === 0 && <div className="px-5 py-6 text-sm text-gray-500">Aucun propriétaire.</div>}
        </div>
      </section>

      <section className="rounded-lg border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h3 className="font-bold text-gray-900">Clients</h3>
          <p className="text-sm text-gray-500">{clients.length} compte(s)</p>
        </div>
        <div className="divide-y divide-gray-100">
          {clients.map((client) => (
            <div key={client.id} className="grid grid-cols-1 gap-3 px-5 py-4 text-sm md:grid-cols-[1fr_auto] md:items-center">
              <div className="flex items-center gap-3">
                <UserAvatar user={client} />
                <div>
                  <p className="font-semibold text-gray-900">{client.name}</p>
                  <p className="text-gray-500">{client.email}</p>
                  <p className={client.enabled ? 'text-green-600' : 'text-red-600'}>{client.enabled ? 'Actif' : 'Bloqué'}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                  value={client.role}
                  disabled={client.id === currentUser?.id}
                  onChange={(event) => handleRoleChange(client, event.target.value)}
                >
                  <option value="USER">User</option>
                  <option value="PROPRIETAIRE">Propriétaire</option>
                </select>
                <Button size="sm" variant="outline" disabled={client.id === currentUser?.id} onClick={() => handleBlockToggle(client)}>
                  {client.enabled ? <Ban size={15} className="mr-1" /> : <RotateCcw size={15} className="mr-1" />}
                  {client.enabled ? 'Bloquer' : 'Débloquer'}
                </Button>
                <Button size="sm" variant="danger" disabled={client.id === currentUser?.id} onClick={() => handleDeleteUser(client)}>
                  <Trash2 size={15} className="mr-1" />
                  Supprimer
                </Button>
              </div>
            </div>
          ))}
          {clients.length === 0 && <div className="px-5 py-6 text-sm text-gray-500">Aucun client.</div>}
        </div>
      </section>
    </div>
  );

  const renderHousesSection = () => (
    <section className="rounded-lg border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4">
        <h3 className="font-bold text-gray-900">Logements</h3>
        <p className="text-sm text-gray-500">{houses.length} logement(s)</p>
      </div>
      <div className="divide-y divide-gray-100">
        {houses.map((house) => (
          <div key={house.id} className="grid grid-cols-1 gap-4 px-5 py-4 text-sm md:grid-cols-[72px_1fr_auto] md:items-center">
            <div className="h-16 w-18 overflow-hidden rounded-md bg-gray-100 text-gray-400">
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
              <p className="text-gray-500">{house.location}</p>
              <p className="text-gray-500">{house.statutValidation || 'EN_ATTENTE'} · {formatPrice(house.price || 0)}</p>
            </div>
            <Button size="sm" variant="danger" onClick={() => handleDeleteHouse(house)}>
              <Trash2 size={15} className="mr-1" />
              Supprimer
            </Button>
          </div>
        ))}
        {houses.length === 0 && <div className="px-5 py-6 text-sm text-gray-500">Aucun logement retourné par le backend.</div>}
      </div>
    </section>
  );

  const renderBookingsSection = () => (
    <section className="rounded-lg border border-gray-100 bg-white p-8 text-center shadow-sm">
      <Calendar className="mx-auto mb-3 text-gray-400" size={32} />
      <h3 className="font-bold text-gray-900">Réservations</h3>
      <p className="mt-2 text-sm text-gray-500">
        Le booking-service ne fournit pas encore de requête administrateur pour lister toutes les réservations.
      </p>
    </section>
  );

  const renderOverview = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title={t('admin_users')} value={usersResponse.total || usersResponse.users.length} icon={<Users size={24} />} colorClass={STAT_COLORS.blue} />
        <StatCard title={t('admin_listings')} value={houses.length} icon={<Home size={24} />} colorClass={STAT_COLORS.purple} />
        <StatCard title={t('admin_bookings')} value="0" icon={<Calendar size={24} />} colorClass={STAT_COLORS.orange} />
        <StatCard title={t('admin_revenue')} value={formatPrice(totalRevenue)} icon={<DollarSign size={24} />} colorClass={STAT_COLORS.green} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
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

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
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
            {houses.length === 0 && <p className="text-sm text-gray-500">Aucun logement retourné par le backend.</p>}
          </div>
        </div>
      </div>
    </>
  );

  const pageTitle = {
    overview: t('admin_title'),
    users: 'Utilisateurs',
    houses: 'Logements',
    bookings: 'Réservations',
  }[section];

  return (
    <div className="flex min-h-[calc(100vh-140px)]">
      {/* Sidebar Admin */}
      <aside className="w-64 bg-gray-900 text-white hidden md:flex flex-col">
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

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
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
