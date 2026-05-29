import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useLanguage } from '../../../hooks/useLanguage';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import GoogleLoginButton from './GoogleLoginButton';
import { Mail, Lock } from 'lucide-react';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [localError, setLocalError] = useState('');

  const from = location.state?.from;
  const redirectTo = from
    ? `${from.pathname || ROUTES.DASHBOARD}${from.search || ''}${from.hash || ''}`
    : ROUTES.DASHBOARD;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setLocalError(err.message || t('common_error'));
    }
  };

  return (
    <div className="w-full max-w-md rounded-xl border border-gray-100 bg-white p-5 shadow-card sm:p-8">
      <div className="mb-6 text-center sm:mb-8">
        <h2 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl">{t('auth_login_title')}</h2>
        <p className="text-gray-500">{t('auth_login_subtitle')}</p>
      </div>

      {(error || localError) && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 text-sm">
          {error || localError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          id="email"
          type="email"
          label={t('auth_email')}
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="votre@email.com"
        />

        <div>
          <Input
            id="password"
            type="password"
            label={t('auth_password')}
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            showPasswordToggle
            passwordVisible={showPassword}
            onTogglePasswordVisibility={() => setShowPassword((value) => !value)}
            required
            placeholder="••••••••"
          />
          <div className="flex justify-end mt-1">
            <a href="#" className="inline-flex min-h-11 items-center text-sm text-primary hover:underline">{t('auth_forgot_password')}</a>
          </div>
        </div>

        <Button type="submit" fullWidth isLoading={loading} className="mt-6">
          {t('auth_login_btn')}
        </Button>
      </form>

      <div className="mt-6 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Ou</span>
        </div>
      </div>

      <GoogleLoginButton
        redirectTo={redirectTo}
        onErrorCallback={(err) => setLocalError(err)}
      />

      <p className="mt-8 text-center text-sm text-gray-600">
        {t('auth_no_account')} <Link to={ROUTES.REGISTER} className="text-primary font-medium hover:underline">{t('nav_register')}</Link>
      </p>
    </div>
  );
};

export default LoginForm;
