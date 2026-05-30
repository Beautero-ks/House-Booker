import { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';

const DeleteAccountSection = ({ onDeleteAccount }) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const confirmationKey = t('profile_delete_confirmation_word');

  const openModal = () => {
    setPassword('');
    setConfirmation('');
    setStatus({ type: '', message: '' });
    setIsOpen(true);
  };

  const handleDelete = async () => {
    setStatus({ type: '', message: '' });

    if (confirmation !== confirmationKey) {
      setStatus({ type: 'error', message: t('profile_delete_confirmation') });
      return;
    }

    setLoading(true);
    try {
      const response = await onDeleteAccount({ currentPassword: password });
      if (response?.success) {
        setStatus({ type: 'success', message: response.message });
      } else {
        setStatus({ type: 'error', message: response?.message || t('profile_delete_error') });
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.message || t('profile_delete_impossible') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-lg border border-rose-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start gap-3 border-b border-rose-100 pb-5 text-rose-700">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-rose-50">
          <AlertTriangle size={22} />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase text-rose-600">{t('profile_section_actions')}</p>
          <h2 className="mt-1 text-xl font-semibold">{t('profile_delete_title')}</h2>
          <p className="mt-1 text-sm text-rose-600">{t('profile_delete_subtitle')}</p>
        </div>
      </div>

      <p className="text-sm text-slate-600">
        {t('profile_delete_help')}
      </p>

      <Button className="mt-6" variant="danger" onClick={openModal}>
        {t('profile_delete_button')}
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={t('profile_delete_modal_title')}>
        {status.message && (
          <div className={`rounded-md border p-4 text-sm ${status.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>
            {status.message}
          </div>
        )}

        <div className="space-y-4 py-3">
          <p className="text-sm text-slate-700">
            {t('profile_delete_modal_instructions')}
          </p>

          <Input
            id="deleteConfirmation"
            label={t('profile_delete_confirm_label')}
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
          />
          <p className="text-sm text-slate-500">{t('profile_delete_confirmation_value', { value: confirmationKey })}</p>

          <Input
            id="deletePassword"
            type="password"
            label={t('profile_delete_password_label')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <Button variant="danger" fullWidth onClick={handleDelete} isLoading={loading}>
            {t('profile_delete_confirm_button')}
          </Button>
          <Button variant="outline" fullWidth onClick={() => setIsOpen(false)}>
            {t('profile_cancel')}
          </Button>
        </div>
      </Modal>
    </section>
  );
};

export default DeleteAccountSection;
