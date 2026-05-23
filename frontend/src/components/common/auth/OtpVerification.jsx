import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useLanguage } from '../../../hooks/useLanguage';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import Button from '../../ui/Button';

const OtpVerification = () => {
  const [code, setCode] = useState('');
  const [resendStatus, setResendStatus] = useState('');
  const [countdown, setCountdown] = useState(0);
  
  const { verifyOtp, resendOtp, user, loading, error } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (!user?.id) {
      navigate(ROUTES.LOGIN);
    }
  }, [user, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!code || code.length < 6) {
      setLocalError('Le code doit contenir 6 caractères');
      return;
    }
    try {
      await verifyOtp(user.id, code);
      navigate(ROUTES.LOGIN);
    } catch (err) {
      setLocalError(err.message || t('common_error'));
    }
  };

  const handleResend = async () => {
    setLocalError('');
    setResendStatus('');
    try {
      const res = await resendOtp(user.id);
      if (res.success) {
        setResendStatus(res.message);
        setCountdown(60); // 60 seconds cooldown
      }
    } catch (err) {
      setLocalError(err.message || 'Erreur lors du renvoi du code');
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-card border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('auth_otp_title')}</h2>
        <p className="text-gray-500">
          {t('auth_otp_subtitle')} <br/>
          <span className="font-medium text-gray-800">{user?.email}</span>
        </p>
      </div>

      {(error || localError) && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 text-sm">
          {error || localError}
        </div>
      )}

      {resendStatus && (
        <div className="bg-green-50 text-green-600 p-3 rounded-md mb-6 text-sm">
          {resendStatus}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1 text-center">
            Code à 6 chiffres
          </label>
          <input
            id="code"
            type="text"
            maxLength={6}
            className="block w-full text-center text-2xl tracking-widest rounded-md border border-gray-300 py-3 focus:border-primary focus:ring-primary"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} // only numbers
            required
          />
        </div>

        <Button type="submit" fullWidth isLoading={loading}>
          {t('auth_otp_verify')}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button 
          type="button" 
          onClick={handleResend}
          disabled={countdown > 0}
          className="text-sm text-primary font-medium hover:underline disabled:text-gray-400 disabled:no-underline"
        >
          {countdown > 0 ? `Renvoyer le code dans ${countdown}s` : t('auth_otp_resend')}
        </button>
      </div>
    </div>
  );
};

export default OtpVerification;
