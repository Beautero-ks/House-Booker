import { useState } from 'react';
import { Mail, Phone, Upload, User } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import Input from '../ui/Input';
import Button from '../ui/Button';

const getInitialForm = (user) => ({
  name: user?.name || '',
  email: user?.email || '',
  phoneNumber: user?.phoneNumber || '',
  photoUrl: user?.photoUrl || '',
});

const ProfileSettingsSection = ({ user, onSave }) => {
  const { t } = useLanguage();
  const [form, setForm] = useState(() => getInitialForm(user));
  const [preview, setPreview] = useState(user?.photoUrl || '');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (!form.name.trim() || !form.email.trim() || !form.phoneNumber.trim()) {
      setStatus({ type: 'error', message: t('profile_input_required') });
      return;
    }

    setLoading(true);
    try {
      await onSave({
        name: form.name.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim(),
        photoUrl: form.photoUrl || null,
      });
      setStatus({ type: 'success', message: t('profile_profile_updated_success') });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Impossible de mettre à jour le profil.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">{t('profile_header_title')}</h1>
        <p className="mt-2 text-sm text-slate-500">{t('profile_subtitle_personal_info')}</p>
      </div>

      {status.message && (
        <div className={`rounded-2xl p-4 text-sm ${status.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 grid gap-6">
        <div className="grid gap-6 md:grid-cols-[180px_1fr] md:items-start">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
            <div className="h-36 w-36 overflow-hidden rounded-full bg-white border border-slate-200">
              {preview ? (
                <img src={preview} alt={t('profile_photo_preview')} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl font-semibold text-slate-400">
                  {(form.name || t('profile_user')).charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100">
              <Upload size={16} />
              <span>{t('profile_change_photo')}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </label>
          </div>

          <div className="grid gap-4">
            <Input
              id="name"
              label={t('profile_label_name')}
              value={form.name}
              onChange={handleChange}
              required
              icon={User}
            />
            <Input
              id="email"
              label={t('profile_label_email')}
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              icon={Mail}
            />
            <Input
              id="phoneNumber"
              label={t('profile_label_phone')}
              type="tel"
              value={form.phoneNumber}
              onChange={handleChange}
              required
              icon={Phone}
            />
          </div>
        </div>

        <Button type="submit" fullWidth isLoading={loading}>
          {t('profile_save_changes')}
        </Button>
      </form>
    </section>
  );
};

export default ProfileSettingsSection;
