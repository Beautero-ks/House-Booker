import { CalendarDays, CheckCircle2, Edit3, Mail, ShieldCheck, UserCircle2 } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

const badgeClass = (type) => {
  switch (type) {
    case 'success':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'warning':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'primary':
      return 'border-blue-200 bg-blue-50 text-blue-700';
    default:
      return 'border-slate-200 bg-slate-50 text-slate-700';
  }
};

const formatDate = (date, lang) => {
  if (!date) return '—';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const ProfileHeader = ({ user }) => {
  const { lang, t } = useLanguage();

  if (!user) return null;

  const initials = (user.name || user.username || user.email || t('profile_user'))
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-gradient-to-r from-[var(--color-secondary)] via-white to-emerald-50 px-5 py-6 sm:px-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-white bg-slate-100 shadow-sm ring-1 ring-slate-200">
              {user.photoUrl ? (
                <img
                  src={user.photoUrl}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-white text-2xl font-semibold text-slate-500">
                  {initials || <UserCircle2 size={48} />}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase text-slate-500">{t('profile_header_title')}</p>
              <h1 className="mt-2 truncate text-2xl font-semibold text-slate-950 sm:text-3xl">
                {user.name || t('profile_user')}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                <span className="inline-flex min-w-0 items-center gap-2">
                  <Mail size={16} className="shrink-0 text-slate-400" />
                  <span className="truncate">{user.email}</span>
                </span>
                {user.username && <span>@{user.username}</span>}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className={`${badgeClass('primary')} inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold`}>
                  <ShieldCheck size={14} />
                  {user.role || 'USER'}
                </span>
                <span className={`${badgeClass(user.isVerified ? 'success' : 'warning')} inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold`}>
                  <CheckCircle2 size={14} />
                  {user.isVerified ? t('profile_verified') : t('profile_not_verified')}
                </span>
              </div>
            </div>
          </div>

          <a
            href="#profile-settings"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)] sm:w-auto"
          >
            <Edit3 size={16} />
            {t('profile_edit_button')}
          </a>
        </div>
      </div>

      <div className="grid gap-px bg-slate-200 sm:grid-cols-3">
        {[
          [t('profile_status_account'), user.enabled ? t('profile_enabled') : t('profile_disabled')],
          [t('profile_status_provider'), user.provider?.toUpperCase() || 'LOCAL'],
          [t('profile_status_created_at'), formatDate(user.createdAt, lang)],
        ].map(([label, value]) => (
          <div key={label} className="bg-white px-5 py-4 sm:px-7">
            <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
            <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
              {label === t('profile_status_created_at') && <CalendarDays size={16} className="text-slate-400" />}
              {value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProfileHeader;
