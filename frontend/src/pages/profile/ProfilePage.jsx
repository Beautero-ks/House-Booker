import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { useProfile } from '../../hooks/profile/useProfile';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileSettingsSection from '../../components/profile/ProfileSettingsSection';
import PasswordSettingsSection from '../../components/profile/PasswordSettingsSection';
import SecurityPanel from '../../components/profile/SecurityPanel';
import DeleteAccountSection from '../../components/profile/DeleteAccountSection';

const ProfilePage = () => {
  const { logout } = useAuth();
  const { t } = useLanguage();
  const { user, loading, error, updateProfile, changePassword, deleteAccount } = useProfile();

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
    <main className="space-y-8 px-4 py-10 lg:px-12">
      <ProfileHeader user={user} />

      <div className="grid gap-8 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-8">
          <ProfileSettingsSection user={user} onSave={updateProfile} />
          <PasswordSettingsSection onChangePassword={changePassword} />
        </div>

        <div className="space-y-8">
          <SecurityPanel user={user} onLogout={logout} />
          <DeleteAccountSection onDeleteAccount={deleteAccount} />
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;
