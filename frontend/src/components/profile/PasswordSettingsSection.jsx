import { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Lock, Eye, EyeOff } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';

const PasswordSettingsSection = ({ onChangePassword }) => {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [visible, setVisible] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const toggle = (field) => {
    setVisible((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setStatus({ type: 'error', message: t('profile_password_required_fields') });
      return;
    }

    if (form.newPassword.length < 8) {
      setStatus({ type: 'error', message: t('profile_password_too_short') });
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setStatus({ type: 'error', message: t('profile_password_mismatch') });
      return;
    }

    setLoading(true);
    try {
      const response = await onChangePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setStatus({ type: response.success ? 'success' : 'error', message: response.message });
      if (response.success) {
        setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Impossible de changer le mot de passe.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">{t('profile_security_password_title')}</h2>
        <p className="text-sm text-slate-500">{t('profile_security_password_subtitle')}</p>
      </div>

      {status.message && (
        <div className={`rounded-2xl p-4 text-sm ${status.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="relative">
          <Input
            id="currentPassword"
            type={visible.current ? 'text' : 'password'}
            label={t('profile_current_password')}
            value={form.currentPassword}
            onChange={handleChange}
            required
            icon={Lock}
          />
          <button
            type="button"
            onClick={() => toggle('current')}
            className="absolute right-3 top-10 text-slate-500"
          >
            {visible.current ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="relative">
          <Input
            id="newPassword"
            type={visible.new ? 'text' : 'password'}
            label={t('profile_new_password')}
            value={form.newPassword}
            onChange={handleChange}
            required
            icon={Lock}
          />
          <button
            type="button"
            onClick={() => toggle('new')}
            className="absolute right-3 top-10 text-slate-500"
          >
            {visible.new ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="relative">
          <Input
            id="confirmPassword"
            type={visible.confirm ? 'text' : 'password'}
            label={t('profile_confirm_password')}
            value={form.confirmPassword}
            onChange={handleChange}
            required
            icon={Lock}
          />
          <button
            type="button"
            onClick={() => toggle('confirm')}
            className="absolute right-3 top-10 text-slate-500"
          >
            {visible.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <Button type="submit" fullWidth isLoading={loading}>
          {t('profile_save_password')}
        </Button>
      </form>
    </section>
  );
};

export default PasswordSettingsSection;
