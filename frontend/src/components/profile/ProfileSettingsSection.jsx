import { useState } from 'react';
import { AtSign, Camera, Link2, Mail, Phone, Upload, User } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import Input from '../ui/Input';
import Button from '../ui/Button';

const splitName = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return { firstName: parts[0] || '', lastName: '' };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
};

const getInitialForm = (user) => {
  const { firstName, lastName } = splitName(user?.name);

  return {
    firstName,
    lastName,
    username: user?.username || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    photoUrl: user?.photoUrl || '',
  };
};

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isValidPhotoUrl = (value) => !value || value.startsWith('data:image/') || /^https?:\/\/\S+\.\S+/.test(value);

const ProfileSettingsSection = ({ user, onSave }) => {
  const { t } = useLanguage();
  const [form, setForm] = useState(() => getInitialForm(user));
  const [preview, setPreview] = useState(user?.photoUrl || '');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: '' }));
    if (id === 'photoUrl') {
      setPreview(value);
    }
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
      setForm((prev) => ({ ...prev, photoUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.firstName.trim()) nextErrors.firstName = t('profile_first_name_required');
    if (!form.lastName.trim()) nextErrors.lastName = t('profile_last_name_required');
    if (!form.email.trim()) nextErrors.email = t('profile_email_required');
    if (form.email.trim() && !isValidEmail(form.email.trim())) nextErrors.email = t('profile_email_invalid');
    if (form.username.trim() && form.username.trim().length < 3) {
      nextErrors.username = t('profile_username_too_short');
    }
    if (!isValidPhotoUrl(form.photoUrl.trim())) nextErrors.photoUrl = t('profile_photo_url_invalid');

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (!validate()) {
      setStatus({ type: 'error', message: t('profile_form_has_errors') });
      return;
    }

    setLoading(true);
    try {
      const name = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
      await onSave({
        name,
        username: form.username.trim() || null,
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim() || null,
        photoUrl: form.photoUrl.trim() || null,
      });
      setStatus({ type: 'success', message: t('profile_profile_updated_success') });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || t('profile_update_error') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="profile-settings" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex flex-col gap-2 border-b border-slate-200 pb-5">
        <p className="text-xs font-semibold uppercase text-[var(--color-primary)]">{t('profile_section_account')}</p>
        <h2 className="text-xl font-semibold text-slate-950">{t('profile_title_personal_info')}</h2>
        <p className="text-sm text-slate-500">{t('profile_subtitle_personal_info')}</p>
      </div>

      {status.message && (
        <div className={`rounded-md border p-4 text-sm ${status.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 grid gap-6">
        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="mx-auto h-32 w-32 overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm">
              {preview ? (
                <img src={preview} alt={t('profile_photo_preview')} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl font-semibold text-slate-400">
                  {(form.firstName || t('profile_user')).charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="mt-4 grid gap-3">
              <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
                <Upload size={16} />
                <span>{t('profile_change_photo')}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
              </label>
              <p className="text-center text-xs leading-5 text-slate-500">{t('profile_photo_help')}</p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="firstName"
                label={t('profile_label_first_name')}
                value={form.firstName}
                onChange={handleChange}
                error={errors.firstName}
                required
                icon={User}
              />
              <Input
                id="lastName"
                label={t('profile_label_last_name')}
                value={form.lastName}
                onChange={handleChange}
                error={errors.lastName}
                required
                icon={User}
              />
            </div>
            <Input
              id="username"
              label={t('profile_label_username')}
              value={form.username}
              onChange={handleChange}
              error={errors.username}
              icon={AtSign}
            />
            <Input
              id="email"
              label={t('profile_label_email')}
              type="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              required
              icon={Mail}
            />
            <Input
              id="phoneNumber"
              label={t('profile_label_phone')}
              type="tel"
              value={form.phoneNumber}
              onChange={handleChange}
              icon={Phone}
            />
            <Input
              id="photoUrl"
              label={t('profile_label_photo_url')}
              value={form.photoUrl}
              onChange={handleChange}
              error={errors.photoUrl}
              icon={Link2}
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm text-slate-500">
            <Camera size={16} />
            {t('profile_photo_instructions')}
          </p>
          <Button type="submit" isLoading={loading} className="w-full sm:w-auto">
            {t('profile_save_changes')}
          </Button>
        </div>
      </form>
    </section>
  );
};

export default ProfileSettingsSection;
