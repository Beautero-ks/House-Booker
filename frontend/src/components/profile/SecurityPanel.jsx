import Button from '../ui/Button';
import { useLanguage } from '../../hooks/useLanguage';

const SecurityPanel = ({ user, onLogout }) => {
  const { t } = useLanguage();

  if (!user) return null;

  const provider = user.provider?.toUpperCase() || 'LOCAL';
  const connectionLabel = provider === 'LOCAL' ? t('profile_connection_local') : provider;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{t('profile_security_title')}</h2>
          <p className="text-sm text-slate-500">{t('profile_security_subtitle')}</p>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{t('profile_connection_method')}</p>
          <p className="mt-3 text-sm text-slate-700">{connectionLabel}</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <Button fullWidth variant="secondary" onClick={onLogout}>
          {t('profile_logout')}
        </Button>
      </div>
    </section>
  );
};

export default SecurityPanel;
