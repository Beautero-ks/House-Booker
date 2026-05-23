import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MOCK_HOUSES } from '../constants/mockData';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/routes';
import { formatPrice, calculateNights } from '../utils/formatters';
import { Check } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const BookingInfoStep = ({ t, user, onContinue }) => (
  <div className="space-y-6 animate-fade-in">
    <h2 className="text-2xl font-bold mb-6">{t('booking_info_title')}</h2>

    <div className="bg-white p-6 rounded-xl border border-gray-200">
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

const BookingPaymentStep = ({ t, total, onPay }) => (
  <div className="space-y-6 animate-fade-in">
    <h2 className="text-2xl font-bold mb-6">{t('payment_choose')}</h2>

    <div className="space-y-3">
      {['payment_mobile', 'payment_card', 'payment_arrival'].map((method, idx) => (
        <label key={method} className="flex items-center justify-between p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <input type="radio" name="payment" className="w-5 h-5 text-primary" defaultChecked={idx === 0} />
            <span className="font-medium text-gray-800">{t(method)}</span>
          </div>
        </label>
      ))}
    </div>

    <Button fullWidth size="lg" onClick={onPay}>
      {t('payment_pay')} {formatPrice(total)}
    </Button>
  </div>
);

const BookingConfirmationStep = ({ house, navigate, t }) => (
  <div className="text-center py-12 animate-fade-in">
    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <Check size={40} className="text-green-500" />
    </div>
    <h2 className="text-3xl font-bold mb-4">{t('booking_confirmed_title')}</h2>
    <p className="text-gray-600 mb-8 max-w-md mx-auto">
      {t('booking_confirmed_message', { houseTitle: house.title })}
    </p>
    <div className="flex gap-4 justify-center">
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
  
  const house = MOCK_HOUSES.find(h => h.id === id) || MOCK_HOUSES[0];
  const { guests = 1, checkIn = '', checkOut = '' } = location.state || {};
  
  const [step, setStep] = useState(1); // 1: Info, 2: Payment, 3: Confirmation
  
  // Calculate prices
  const nights = (checkIn && checkOut) ? calculateNights(checkIn, checkOut) : 2; // default 2 nights for demo
  const totalNightsPrice = house.price * nights;
  const serviceFee = 1000;
  const total = totalNightsPrice + serviceFee;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      
      {/* Stepper Header */}
      <div className="flex items-center justify-center mb-12">
        <div className={`flex items-center ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200'}`}>1</div>
          <span className="ml-2 font-medium hidden sm:inline">{t('booking_step_info')}</span>
        </div>
        <div className={`w-16 sm:w-24 h-1 mx-4 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
        
        <div className={`flex items-center ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200'}`}>2</div>
          <span className="ml-2 font-medium hidden sm:inline">{t('booking_step_payment')}</span>
        </div>
        <div className={`w-16 sm:w-24 h-1 mx-4 ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
        
        <div className={`flex items-center ${step >= 3 ? 'text-primary' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-200'}`}>3</div>
          <span className="ml-2 font-medium hidden sm:inline">{t('booking_step_confirmation')}</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Dynamic Left Content */}
        <div className="flex-1">
          {step === 1 && <BookingInfoStep t={t} user={user} onContinue={() => setStep(2)} />}
          {step === 2 && <BookingPaymentStep t={t} total={total} onPay={() => setStep(3)} />}
          {step === 3 && <BookingConfirmationStep house={house} navigate={navigate} t={t} />}
        </div>

        {/* Right Summary Sidebar (hidden on confirmation step) */}
        {step < 3 && (
          <div className="w-full lg:w-[400px]">
            <div className="bg-white p-6 rounded-2xl shadow-card border border-gray-100 sticky top-24">
              <h3 className="text-xl font-bold mb-4">{t('payment_summary')}</h3>
              
              <div className="flex gap-4 mb-6 pb-6 border-b">
                <img src={house.images[0]} alt={house.title} className="w-24 h-24 object-cover rounded-lg" />
                <div>
                  <h4 className="font-semibold text-gray-900 line-clamp-2">{house.title}</h4>
                  <p className="text-sm text-gray-500">{house.location}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('booking_arrival')}</span>
                  <span className="font-medium">{checkIn || '12/06/2024'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('booking_departure')}</span>
                  <span className="font-medium">{checkOut || '14/06/2024'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('booking_guests_count')}</span>
                  <span className="font-medium">{t('booking_guest_count_value', { count: guests })}</span>
                </div>
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('booking_price_night_count', { count: nights })}</span>
                  <span className="font-medium">{formatPrice(totalNightsPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('booking_service_fee')}</span>
                  <span className="font-medium">{formatPrice(serviceFee)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
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
