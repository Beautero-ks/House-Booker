import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/routes';
import { formatPrice, calculateNights } from '../utils/formatters';
import { Check, ImageOff } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/common/EmptyState';
import { getHouseById } from '../services/houseApi';
import { createBooking } from '../services/bookingApi';
import { getAuthenticatedUserId } from '../utils/authUser';

const BookingInfoStep = ({ t, user, onContinue }) => (
  <div className="space-y-6 animate-fade-in">
    <h2 className="mb-6 text-xl font-bold sm:text-2xl">{t('booking_info_title')}</h2>

    <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
      <h3 className="text-lg font-semibold mb-4">{t('booking_your_info')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label={t('booking_full_name')} defaultValue={user?.name || ''} />
        <Input label={t('booking_email')} type="email" defaultValue={user?.email || ''} />
        <Input label={t('booking_phone')} type="tel" defaultValue={user?.phoneNumber || ''} />
      </div>
    </div>

    <Button fullWidth size="lg" onClick={onContinue}>
      {t('booking_continue')}
    </Button>
  </div>
);

const BookingPaymentStep = ({ t, total, onPay, submitting }) => (
  <div className="space-y-6 animate-fade-in">
    <h2 className="mb-6 text-xl font-bold sm:text-2xl">{t('payment_choose')}</h2>

    <div className="space-y-3">
      {['payment_mobile', 'payment_card', 'payment_arrival'].map((method, idx) => (
        <label key={method} className="flex min-h-14 cursor-pointer items-center justify-between rounded-xl border p-4 transition-colors hover:bg-gray-50">
          <div className="flex items-center gap-3">
            <input type="radio" name="payment" className="w-5 h-5 text-primary" defaultChecked={idx === 0} />
            <span className="font-medium text-gray-800">{t(method)}</span>
          </div>
        </label>
      ))}
    </div>

    <Button fullWidth size="lg" onClick={onPay} isLoading={submitting}>
      {t('payment_pay')} {formatPrice(total)}
    </Button>
  </div>
);

const BookingConfirmationStep = ({ house, navigate, t }) => (
  <div className="animate-fade-in py-8 text-center sm:py-12">
    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <Check size={40} className="text-green-500" />
    </div>
    <h2 className="mb-4 text-2xl font-bold sm:text-3xl">{t('booking_confirmed_title')}</h2>
    <p className="text-gray-600 mb-8 max-w-md mx-auto">
      {t('booking_confirmed_message', { houseTitle: house.title })}
    </p>
    <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
      <Button variant="outline" onClick={() => navigate(ROUTES.DASHBOARD)}>{t('booking_view_bookings')}</Button>
      <Button onClick={() => navigate(ROUTES.HOME)}>{t('booking_back_home')}</Button>
    </div>
  </div>
);

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { user } = useAuth();
  const userId = getAuthenticatedUserId(user);

  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingError, setBookingError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { guests = 1, checkIn = '', checkOut = '' } = location.state || {};
  
  const [step, setStep] = useState(1); // 1: Info, 2: Payment, 3: Confirmation

  useEffect(() => {
    let mounted = true;

    const loadHouse = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getHouseById(id);
        if (mounted) setHouse(result);
      } catch (err) {
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadHouse();
    return () => {
      mounted = false;
    };
  }, [id]);
  
  // Calculate prices
  const nights = (checkIn && checkOut) ? calculateNights(checkIn, checkOut) : 0;
  const totalNightsPrice = (house?.price || 0) * nights;
  const serviceFee = 1000;
  const total = totalNightsPrice + serviceFee;

  const handlePay = async () => {
    setBookingError('');
    if (!userId) {
      setBookingError(t('booking_login_required'));
      return;
    }
    if (!checkIn || !checkOut) {
      setBookingError(t('booking_dates_required'));
      return;
    }

    setSubmitting(true);
    try {
      await createBooking({
        userId,
        houseId: house.id,
        startDate: checkIn,
        endDate: checkOut,
      });
      setStep(3);
    } catch (err) {
      setBookingError(err.message || t('booking_create_error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <Loader />
      </div>
    );
  }

  if (error || !house) {
    return (
      <div className="container mx-auto px-4 py-20">
        <EmptyState
          icon={<Check size={48} className="text-gray-300 mb-4" />}
          title={t('booking_unavailable_title')}
          description={error?.message || t('booking_missing_house')}
          action={<Button variant="outline" onClick={() => navigate(ROUTES.SEARCH)}>{t('booking_back_to_listings')}</Button>}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 sm:py-12">
      
      {/* Stepper Header */}
      <div className="mb-8 flex items-center justify-center sm:mb-12">
        <div className={`flex items-center ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200'}`}>1</div>
          <span className="ml-2 font-medium hidden sm:inline">{t('booking_step_info')}</span>
        </div>
        <div className={`mx-2 h-1 w-8 sm:mx-4 sm:w-24 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
        
        <div className={`flex items-center ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200'}`}>2</div>
          <span className="ml-2 font-medium hidden sm:inline">{t('booking_step_payment')}</span>
        </div>
        <div className={`mx-2 h-1 w-8 sm:mx-4 sm:w-24 ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
        
        <div className={`flex items-center ${step >= 3 ? 'text-primary' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-200'}`}>3</div>
          <span className="ml-2 font-medium hidden sm:inline">{t('booking_step_confirmation')}</span>
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        {/* Dynamic Left Content */}
        <div className="flex-1">
          {step === 1 && <BookingInfoStep t={t} user={user} onContinue={() => setStep(2)} />}
          {step === 2 && (
            <>
              {bookingError && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{bookingError}</p>}
              <BookingPaymentStep t={t} total={total} onPay={handlePay} submitting={submitting} />
            </>
          )}
          {step === 3 && <BookingConfirmationStep house={house} navigate={navigate} t={t} />}
        </div>

        {/* Right Summary Sidebar (hidden on confirmation step) */}
        {step < 3 && (
          <div className="w-full lg:w-[400px]">
            <div className="sticky top-20 rounded-xl border border-gray-100 bg-white p-4 shadow-card sm:p-6 lg:top-24 lg:rounded-2xl">
              <h3 className="text-xl font-bold mb-4">{t('payment_summary')}</h3>
              
              <div className="mb-6 flex gap-4 border-b pb-6">
                {house.images?.[0] ? (
                  <img src={house.images[0]} alt={house.title} className="w-24 h-24 object-cover rounded-lg" />
                ) : (
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                    <ImageOff size={24} />
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="font-semibold text-gray-900 line-clamp-2">{house.title}</h4>
                  <p className="text-sm text-gray-500">{house.location}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">{t('booking_arrival')}</span>
                  <span className="font-medium">{checkIn || '12/06/2024'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">{t('booking_departure')}</span>
                  <span className="font-medium">{checkOut || '14/06/2024'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">{t('booking_guests_count')}</span>
                  <span className="font-medium">{t('booking_guest_count_value', { count: guests })}</span>
                </div>
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">{t('booking_price_night_count', { count: nights })}</span>
                  <span className="font-medium">{formatPrice(totalNightsPrice)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">{t('booking_service_fee')}</span>
                  <span className="font-medium">{formatPrice(serviceFee)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="font-bold text-lg">{t('booking_total')}</span>
                <span className="font-bold text-xl text-primary">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
