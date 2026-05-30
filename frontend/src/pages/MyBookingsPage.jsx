import { useEffect, useMemo, useState } from 'react';
import { Calendar, Home, User, XCircle } from 'lucide-react';
import PaginationControls, { PAGE_SIZE } from '../components/common/PaginationControls';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { cancelBooking, getMyBookings } from '../services/bookingApi';
import { getHouseById } from '../services/houseApi';
import { getAuthenticatedUserId } from '../utils/authUser';
import { formatPrice } from '../utils/formatters';

const CANCELLABLE_STATUSES = new Set(['PENDING', 'CONFIRMED']);
const CANCELLED_STATUSES = new Set(['CANCELLED', 'CANCELED', 'cancelled', 'canceled', 'annulée']);
const STATUS_STYLES = {
  CONFIRMED: {
    labelKey: 'status_confirmed',
    badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    border: 'border-l-emerald-500',
  },
  PENDING: {
    labelKey: 'status_pending',
    badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    border: 'border-l-amber-500',
  },
  CANCELLED: {
    labelKey: 'status_cancelled',
    badge: 'bg-red-50 text-red-700 ring-1 ring-red-200',
    border: 'border-l-red-500',
  },
};

const getReservationNumber = (page, index) => (page - 1) * PAGE_SIZE + index + 1;

const MyBookingsPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const userId = getAuthenticatedUserId(user);
  const [bookings, setBookings] = useState([]);
  const [houseTitles, setHouseTitles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [cancellingId, setCancellingId] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let mounted = true;

    const loadBookings = async () => {
      setLoading(true);
      setError('');
      try {
        const result = await getMyBookings({ userId, size: 100 });
        if (mounted) setBookings(result);

        const uniqueHouseIds = [...new Set(result.map((booking) => booking.houseId).filter(Boolean))];
        const titleEntries = await Promise.all(
          uniqueHouseIds.map(async (houseId) => {
            try {
              const house = await getHouseById(houseId);
              return [houseId, house?.title || houseId];
            } catch {
              return [houseId, houseId];
            }
          })
        );

        if (mounted) setHouseTitles(Object.fromEntries(titleEntries));
      } catch (err) {
        if (mounted) setError(err.message || t('my_bookings_load_error'));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadBookings();
    return () => {
      mounted = false;
    };
  }, [t, userId]);

  const handleCancelBooking = async (booking) => {
    if (!CANCELLABLE_STATUSES.has(booking.status)) return;
    const confirmed = window.confirm(t('my_bookings_cancel_confirm'));
    if (!confirmed) return;

    setCancellingId(booking.id);
    setActionError('');
    try {
      const cancelled = await cancelBooking({ bookingId: booking.id, userId });
      setBookings((current) => current.filter((item) => item.id !== cancelled.id));
    } catch (err) {
      setActionError(err.message || t('my_bookings_cancel_error'));
    } finally {
      setCancellingId('');
    }
  };

  const visibleBookings = useMemo(() => (
    [...bookings]
      .filter((booking) => !CANCELLED_STATUSES.has(booking.status))
      .sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate))
  ), [bookings]);

  const totalPages = Math.max(1, Math.ceil(visibleBookings.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedBookings = visibleBookings.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const getStatusStyle = (status) => STATUS_STYLES[status] || {
    label: status || t('my_bookings_unknown_status'),
    badge: 'bg-slate-50 text-slate-700 ring-1 ring-slate-200',
    border: 'border-l-slate-400',
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-gray-50">
      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{t('my_bookings_title')}</h1>
          <p className="text-sm text-gray-500">{t('my_bookings_subtitle')}</p>
        </div>

        {loading && <Loader />}
        {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {actionError && <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</div>}

        <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
          <div className="flex flex-col gap-1 border-b border-gray-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-semibold text-gray-900">{t('my_bookings_list_title')}</h2>
            <p className="text-sm text-gray-500">{t('my_bookings_active_count', { count: visibleBookings.length })}</p>
          </div>

          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <table className="min-w-[780px] divide-y divide-gray-100 text-sm sm:min-w-full">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-3">{t('dashboard_table_booking')}</th>
                  <th className="px-5 py-3">{t('dashboard_table_listing')}</th>
                  <th className="px-5 py-3">{t('dashboard_table_dates')}</th>
                  <th className="px-5 py-3">{t('dashboard_table_status')}</th>
                  <th className="px-5 py-3">{t('dashboard_table_amount')}</th>
                  <th className="px-5 py-3 text-right">{t('dashboard_table_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {paginatedBookings.map((booking, index) => {
                  const statusStyle = getStatusStyle(booking.status);

                  return (
                    <tr key={booking.id} className="align-middle transition-colors hover:bg-gray-50">
                      <td className="px-5 py-4 font-semibold text-gray-900">{t('my_bookings_label', { number: getReservationNumber(currentPage, index) })}</td>
                      <td className="break-all px-5 py-4 text-gray-600">
                        <span className="flex items-center gap-2"><Home size={15} className="shrink-0 text-gray-400" /> {houseTitles[booking.houseId] || booking.houseId}</span>
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        <span className="flex items-center gap-2"><Calendar size={15} className="shrink-0 text-gray-400" /> {booking.startDate} - {booking.endDate}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusStyle.badge}`}>
                          <User size={14} />
                          {statusStyle.labelKey ? t(statusStyle.labelKey) : statusStyle.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-semibold text-gray-900">{formatPrice(booking.totalPrice || 0)}</td>
                      <td className="px-5 py-4 text-right">
                        {CANCELLABLE_STATUSES.has(booking.status) && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-gray-200 text-gray-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            isLoading={cancellingId === booking.id}
                            onClick={() => handleCancelBooking(booking)}
                          >
                            <XCircle size={15} className="mr-2" />
                            {t('dashboard_cancel')}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {!loading && paginatedBookings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-gray-500">{t('my_bookings_no_active')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <PaginationControls page={currentPage} totalItems={visibleBookings.length} onPageChange={setPage} label={t('admin_bookings_count', { count: '' }).trim()} />
        </div>
      </main>
    </div>
  );
};

export default MyBookingsPage;
