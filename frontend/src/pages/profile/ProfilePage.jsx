import { useLanguage } from '../../hooks/useLanguage';
import { useProfile } from '../../hooks/profile/useProfile';
import ProfileSettingsSection from '../../components/profile/ProfileSettingsSection';

const ProfilePage = () => {
  const { t } = useLanguage();
  const { user, loading, error, updateProfile } = useProfile();

  if (loading) {
    return (
      <main className="px-4 py-10 lg:px-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-700 shadow-sm">
          {t('profile_loading')}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="px-4 py-10 lg:px-12">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-10 text-center text-rose-800 shadow-sm">
          {t('profile_error')}
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 py-10 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <ProfileSettingsSection key={`${user?.id || 'profile'}-${user?.updatedAt || ''}`} user={user} onSave={updateProfile} />
      </div>
    </main>
  );
};

export default ProfilePage;
