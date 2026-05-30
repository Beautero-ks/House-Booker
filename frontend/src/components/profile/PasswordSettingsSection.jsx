import { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { CheckCircle2, Lock, ShieldCheck } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';

const getPasswordStrength = (password) => {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;

  if (!password) return { score: 0, key: 'profile_password_strength_empty', color: 'bg-slate-200' };
  if (score <= 2) return { score, key: 'profile_password_strength_weak', color: 'bg-rose-500' };
  if (score <= 4) return { score, key: 'profile_password_strength_medium', color: 'bg-amber-500' };
  return { score, key: 'profile_password_strength_strong', color: 'bg-emerald-500' };
};

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
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const strength = getPasswordStrength(form.newPassword);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: '' }));
  };

  const toggle = (field) => {
    setVisible((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    const nextErrors = {};

    if (!form.currentPassword) nextErrors.currentPassword = t('profile_current_password_required');
    if (!form.newPassword) nextErrors.newPassword = t('profile_new_password_required');
    if (form.newPassword && form.newPassword.length < 8) nextErrors.newPassword = t('profile_password_too_short');
    if (!form.confirmPassword) nextErrors.confirmPassword = t('profile_confirm_password_required');
    if (form.newPassword && form.confirmPassword && form.newPassword !== form.confirmPassword) {
      nextErrors.confirmPassword = t('profile_password_mismatch');
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setStatus({ type: 'error', message: t('profile_password_required_fields') });
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
        setVisible({ current: false, new: false, confirm: false });
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.message || t('profile_password_change_error') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex flex-col gap-2 border-b border-slate-200 pb-5">
        <p className="text-xs font-semibold uppercase text-[var(--color-primary)]">{t('profile_section_security')}</p>
        <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-950">
          <ShieldCheck size={20} className="text-[var(--color-primary)]" />
          {t('profile_security_password_title')}
        </h2>
        <p className="text-sm text-slate-500">{t('profile_security_password_subtitle')}</p>
      </div>

      {status.message && (
        <div className={`mb-5 rounded-md border p-4 text-sm ${status.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-5">
        <div className="grid gap-4 md:grid-cols-3">
          <Input
            id="currentPassword"
            type="password"
            label={t('profile_current_password')}
            value={form.currentPassword}
            onChange={handleChange}
            error={errors.currentPassword}
            required
            icon={Lock}
            showPasswordToggle
            passwordVisible={visible.current}
            onTogglePasswordVisibility={() => toggle('current')}
          />
          <Input
            id="newPassword"
            type="password"
            label={t('profile_new_password')}
            value={form.newPassword}
            onChange={handleChange}
            error={errors.newPassword}
            required
            icon={Lock}
            showPasswordToggle
            passwordVisible={visible.new}
            onTogglePasswordVisibility={() => toggle('new')}
          />
          <Input
            id="confirmPassword"
            type="password"
            label={t('profile_confirm_password')}
            value={form.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            required
            icon={Lock}
            showPasswordToggle
            passwordVisible={visible.confirm}
            onTogglePasswordVisibility={() => toggle('confirm')}
          />
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="font-medium text-slate-700">{t('profile_password_strength')}</span>
            <span className="font-semibold text-slate-900">{t(strength.key)}</span>
          </div>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <span
                key={index}
                className={`h-1.5 rounded-full ${index < strength.score ? strength.color : 'bg-slate-200'}`}
              />
            ))}
          </div>
          <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2 size={14} />
            {t('profile_password_strength_help')}
          </p>
        </div>

        <div className="flex justify-end border-t border-slate-200 pt-5">
          <Button type="submit" isLoading={loading} className="w-full sm:w-auto">
            {t('profile_save_password')}
          </Button>
        </div>
      </form>
    </section>
  );
};

export default PasswordSettingsSection;
