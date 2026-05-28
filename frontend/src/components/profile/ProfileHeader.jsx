import { UserCircle2 } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

const badgeClass = (type) => {
  switch (type) {
    case 'success':
      return 'bg-emerald-100 text-emerald-800';
    case 'warning':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
};

const ProfileHeader = ({ user }) => {
  const { t } = useLanguage();

  if (!user) return null;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-24 w-24 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
            {user.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-400">
                <UserCircle2 size={48} />
              </div>
            )}
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{t('profile_header_title')}</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">{user.name || t('profile_user')}</h1>
            <p className="mt-1 text-sm text-slate-600">{user.email}</p>
            {user.phoneNumber && (
              <p className="mt-1 text-sm text-slate-600">{user.phoneNumber}</p>
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{t('profile_status_account')}</p>
            <span className={badgeClass(user.isVerified ? 'success' : 'warning') + ' mt-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold'}>
              {user.isVerified ? t('profile_verified') : t('profile_not_verified')}
            </span>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{t('profile_status_status')}</p>
            <span className={badgeClass(user.enabled ? 'success' : 'warning') + ' mt-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold'}>
              {user.enabled ? t('profile_enabled') : t('profile_disabled')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileHeader;
