import { Link } from 'react-router-dom';
import { Building2, Clock3, KeyRound, LogOut, ShieldCheck, UserCheck } from 'lucide-react';
import Button from '../ui/Button';
import { useLanguage } from '../../hooks/useLanguage';
import { ROUTES } from '../../constants/routes';
import { formatJwtStatus, getJwtStatus } from '../../utils/profile/jwt';

const formatDateTime = (date, lang) => {
  if (!date) return '—';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleString(lang === 'en' ? 'en-US' : 'fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const SecurityPanel = ({ user, onLogout }) => {
  const { lang, t } = useLanguage();

  if (!user) return null;

  const provider = user.provider?.toUpperCase() || 'LOCAL';
  const connectionLabel = provider === 'LOCAL' ? t('profile_connection_local') : provider;
  const jwtStatus = getJwtStatus();
  const canAccessHouses = ['PROPRIETAIRE', 'ADMIN'].includes(user.role);
  const items = [
    {
      icon: KeyRound,
      label: t('profile_connection_method'),
      value: connectionLabel,
    },
    {
      icon: UserCheck,
      label: t('profile_status_status'),
      value: user.enabled ? t('profile_enabled') : t('profile_disabled'),
    },
    {
      icon: ShieldCheck,
      label: t('profile_jwt_label'),
      value: formatJwtStatus(jwtStatus, lang, t),
    },
    {
      icon: Clock3,
      label: t('profile_status_updated_at'),
      value: formatDateTime(user.updatedAt, lang),
    },
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase text-[var(--color-primary)]">{t('profile_section_security')}</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">{t('profile_security_title')}</h2>
          <p className="mt-1 text-sm text-slate-500">{t('profile_security_subtitle')}</p>
        </div>
      </div>

      <div className="grid gap-4">
        {items.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-[var(--color-primary)] ring-1 ring-slate-200">
                <Icon size={18} />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
                <p className="mt-1 break-words text-sm font-semibold text-slate-900">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-3">
        {canAccessHouses && (
          <Button as={Link} to={ROUTES.MY_HOUSES} fullWidth variant="outline">
            <Building2 size={16} className="mr-2" />
            {t('profile_my_houses')}
          </Button>
        )}
        <Button fullWidth variant="secondary" onClick={onLogout}>
          <LogOut size={16} className="mr-2" />
          {t('profile_logout')}
        </Button>
      </div>
    </section>
  );
};

export default SecurityPanel;
