import { useLanguage } from '../../hooks/useLanguage';
import { useProfile } from '../../hooks/profile/useProfile';
import DeleteAccountSection from '../../components/profile/DeleteAccountSection';
import PasswordSettingsSection from '../../components/profile/PasswordSettingsSection';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileSettingsSection from '../../components/profile/ProfileSettingsSection';
import SecurityPanel from '../../components/profile/SecurityPanel';

const ProfilePage = () => {
  const { t } = useLanguage();
  const { user, loading, error, updateProfile, changePassword, deleteAccount } = useProfile();

  if (loading) {
    return (
      <main className="px-4 py-8 sm:px-6 lg:px-12">
        <div className="mx-auto max-w-6xl rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-700 shadow-sm sm:p-10">
          {t('profile_loading')}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="px-4 py-8 sm:px-6 lg:px-12">
        <div className="mx-auto max-w-6xl rounded-lg border border-rose-200 bg-rose-50 p-6 text-center text-rose-800 shadow-sm sm:p-10">
          {t('profile_error')}
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-12">
      <div className="mx-auto grid max-w-6xl gap-6">
        <ProfileHeader user={user} />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="grid gap-6">
            <ProfileSettingsSection
              key={`${user?.id || 'profile'}-${user?.updatedAt || ''}`}
              user={user}
              onSave={updateProfile}
            />
            <PasswordSettingsSection onChangePassword={changePassword} />
          </div>

          <aside className="grid content-start gap-6">
            <SecurityPanel user={user} />
            <DeleteAccountSection onDeleteAccount={deleteAccount} />
          </aside>
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;
