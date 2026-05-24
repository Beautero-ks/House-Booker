import { useEffect, useState } from 'react';
import { Upload, User, Mail, Hash } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import Input from '../ui/Input';
import Button from '../ui/Button';

const ProfileSettingsSection = ({ user, onSave }) => {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    photoUrl: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        photoUrl: user.photoUrl || '',
      });
      setPreview(user.photoUrl || '');
    }
  }, [user]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoFile(file);
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

    if (!form.name.trim() || !form.email.trim()) {
      setStatus({ type: 'error', message: t('profile_input_required') });
    }

    setLoading(true);
    try {
      await onSave({
        name: form.name.trim(),
        username: form.username.trim() || null,
        email: form.email.trim(),
        photoUrl: form.photoUrl || null,
      });
      setStatus({ type: 'success', message: 'Profil mis à jour avec succès.' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Impossible de mettre à jour le profil.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{t('profile_title_personal_info')}</h2>
          <p className="text-sm text-slate-500">{t('profile_subtitle_personal_info')}</p>
        </div>
      </div>

      {status.message && (
        <div className={`rounded-2xl p-4 text-sm ${status.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 grid gap-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            id="name"
            label={t('profile_label_name')}
            value={form.name}
            onChange={handleChange}
            required
            icon={User}
          />
          <Input
            id="username"
            label={t('profile_label_username')}
            value={form.username}
            onChange={handleChange}
            icon={Hash}
          />
        </div>

        <Input
          id="email"
          label={t('profile_label_email')}
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          icon={Mail}
        />

        <div className="grid gap-4 md:grid-cols-[180px_1fr] items-start">
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-center">
            <div className="h-36 w-36 overflow-hidden rounded-3xl bg-white border border-slate-200">
              {preview ? (
                <img src={preview} alt={t('profile_photo_preview')} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-400">{t('profile_photo_preview')}</div>
              )}
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-200">
              <Upload size={16} />
              <span>{t('profile_change_photo')}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </label>
          </div>

          <div className="grid gap-4">
            <p className="text-sm text-slate-500">{t('profile_photo_instructions')}</p>
            <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              {t('profile_photo_help')}
            </p>
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
