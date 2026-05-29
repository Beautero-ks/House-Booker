import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useLanguage } from '../../../hooks/useLanguage';
import { useNavigate, Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import GoogleLoginButton from './GoogleLoginButton';
import { Mail, Lock, User, Phone } from 'lucide-react';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  
  const { register, loading, error } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    try {
      await register(formData.name, formData.email, formData.password, formData.phoneNumber);
      // Registration successful, navigate to OTP page
      navigate(ROUTES.OTP);
    } catch (err) {
      setLocalError(err.message || t('common_error'));
    }
  };

  return (
    <div className="w-full max-w-md rounded-xl border border-gray-100 bg-white p-5 shadow-card sm:p-8">
      <div className="mb-6 text-center sm:mb-8">
        <h2 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl">{t('auth_register_title')}</h2>
        <p className="text-gray-500">{t('auth_register_subtitle')}</p>
      </div>

      {(error || localError) && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 text-sm">
          {error || localError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="name"
          type="text"
          label={t('auth_name')}
          icon={User}
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Jean Dupont"
        />

        <Input
          id="email"
          type="email"
          label={t('auth_email')}
          icon={Mail}
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="votre@email.com"
        />

        <Input
          id="phoneNumber"
          type="tel"
          label={t('auth_phone')}
          icon={Phone}
          value={formData.phoneNumber}
          onChange={handleChange}
          required
          placeholder="+237 600 000 000"
        />

        <Input
          id="password"
          type="password"
          label={t('auth_password')}
          icon={Lock}
          value={formData.password}
          onChange={handleChange}
          showPasswordToggle
          passwordVisible={showPassword}
          onTogglePasswordVisibility={() => setShowPassword((value) => !value)}
          required
          placeholder="••••••••"
        />

        <Button type="submit" fullWidth isLoading={loading} className="mt-6">
          {t('auth_register_btn')}
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

      <GoogleLoginButton onErrorCallback={(err) => setLocalError(err)} />

      <p className="mt-8 text-center text-sm text-gray-600">
        {t('auth_has_account')} <Link to={ROUTES.LOGIN} className="text-primary font-medium hover:underline">{t('nav_login')}</Link>
      </p>
    </div>
  );
};

export default RegisterForm;
