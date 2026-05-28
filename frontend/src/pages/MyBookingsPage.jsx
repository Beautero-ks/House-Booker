import { useEffect, useState } from 'react';
import { Calendar, Home, User } from 'lucide-react';
import Loader from '../components/ui/Loader';
import { useAuth } from '../hooks/useAuth';
import { getMyBookings } from '../services/bookingApi';
import { getAuthenticatedUserId } from '../utils/authUser';
import { formatPrice } from '../utils/formatters';

const MyBookingsPage = () => {
  const { user } = useAuth();
  const userId = getAuthenticatedUserId(user);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadBookings = async () => {
      setLoading(true);
      setError('');
      try {
        const result = await getMyBookings({ userId, size: 100 });
        if (mounted) setBookings(result);
      } catch (err) {
        if (mounted) setError(err.message || 'Impossible de charger vos réservations.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadBookings();
    return () => {
      mounted = false;
    };
  }, [userId]);

  return (
    <div className="min-h-[calc(100vh-140px)] bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-gray-900">Mes réservations</h1>
          <p className="text-sm text-gray-500">Retrouvez l'ensemble de vos réservations.</p>
        </div>

        {loading && <Loader />}
        {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
          {bookings.map((booking) => (
            <div key={booking.id} className="grid grid-cols-1 gap-3 border-b border-gray-100 p-4 text-sm md:grid-cols-[1.2fr_1fr_1fr_1fr] md:items-center">
              <div>
                <p className="font-semibold text-gray-900">{booking.id}</p>
                <p className="mt-1 flex items-center gap-2 text-gray-500"><Home size={15} /> {booking.houseId}</p>
              </div>
              <span className="flex items-center gap-2 text-gray-600"><Calendar size={15} /> {booking.startDate} - {booking.endDate}</span>
              <span className="flex items-center gap-2 text-gray-600"><User size={15} /> {booking.status}</span>
              <span className="font-semibold text-gray-900">{formatPrice(booking.totalPrice || 0)}</span>
            </div>
          ))}
          {!loading && bookings.length === 0 && (
            <div className="p-8 text-center text-gray-500">Aucune réservation retournée par le backend.</div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyBookingsPage;
